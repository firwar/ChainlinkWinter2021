// SPDX-License-Identifier: MIT
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


/* ------   NOTES    -----------
- Keeper calls "checkData"

- demand is some default value = 0
- mapping of demand list, push to the end of the list
- mapping of compliance list
- mapping of thermostat list

- always check the end of the demand list for the lastest value
- Pact
	- "checkData"
		- check current block number
		- if block number > 15 (?) minutes since last call then execute
			- call to nest to get data
			- once fullfilled
				- call the energy counter compliance increment
				- call to EIA update demand if mod is some interval
					- push to end of demand list
*/

// This is the main building block for smart contracts.
contract Pact is Ownable, ChainlinkClient {

    using Chainlink for Chainlink.Request;

    struct NestData {
        uint mode;
        uint temperature;
        uint heatSetpoint;
        uint coolSetpoint;
    }

    enum PactState { Disabled, Idle, Running }
    
    // Events
    event RequestingNestData(uint numberOfNestRequests);
    event CalculatingUserCompliance(address user, bool compliant);
    event RequestingEIAData();


    PactState public pactState;
    uint public lastBlockNumberEIA;
    uint public lastBlockNumberKeeper;

    // Demand threshold before thermostat is controlled in megaWattHours
    uint256 public demandThreshold;
    // Maximum heat set point allowable
    uint256 public demandHeatSetpoint;
    // Minimum cool set point allowable
    uint256 public demandCoolSetpoint;

    // The energy count for each cycle
    mapping (uint256 => uint256) private cycleToEnergyCount; 

    mapping ( address => NestData[] ) public userAddressToNestData;
    
    mapping ( address => PactState ) public userAddressToPactState;

    // demand data stored
    mapping ( uint256 => uint256[] ) public regionToDemandData;
    
    // user address mapping to compliance data list of whether user was compliant
    // during check (1's and 0's)
    mapping ( address => uint256[] ) public userAddressToComplianceData;
    // The count of number of times we are compliant in this cycle
    mapping ( address => uint256 ) public userAddressToEnergyCountCycle;

    mapping ( bytes32 => address) private requestIdToUserAddress;

    // Participants in current pact
    address[] public participants;



    // EA Information
    address private nestOracle = 0xa94fcD7aaeD52a5D8a525319B16b4d3296a02F6A;
    bytes32 private nestJobId = "fc173fc92d5748cc8d76ceb21d442a56";
    uint256 private nestFee = 0.1 * 10 ** 18;

    // EA Information for API Oracle EIA
    address private EIAOracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
    bytes32 private EIAJobId = "d5270d1c311941d0b08bead21fea7747";
    uint256 private EIAFee = 0.1 * 10 ** 18;  

    // Some block stuff rough estimate assuming ~ 13 seconds per block
    uint8 private blocksPerFiveMinutes = 5;

    // 30 minutes worth of blocks = (60 seconds / minutes) * (30 minutes) / (10 seconds / block) 
    uint256 private EIA_UPDATE_NUM_BLOCKS = 60 * 30 / 10;
    uint256 private KEEPER_UPDATE_NUM_BLOCKS = 5;

    constructor() public {
        // Chainlink EIA Node
        setPublicChainlinkToken();
        
        // Update to current block number
        lastBlockNumberEIA = block.number;
        lastBlockNumberKeeper = block.number;

        demandThreshold = 30000;
        demandHeatSetpoint = 60;
        demandCoolSetpoint = 80;
    }

    function joinPact(uint256 _region, address nestAddress) external {

        participants.push(msg.sender);
        userAddressToPactState[msg.sender] = PactState.Idle;
    }
 
    function startNewCycle() external {

    }

    function changeConditions(uint256 _demandThreshold, uint256 _heatSetpoint, uint256 _coolSetpoint) external {
        demandThreshold = _demandThreshold;
        demandHeatSetpoint = _heatSetpoint;
        demandCoolSetpoint = _coolSetpoint;
    }

    function terminatePact() external {

    }

    /*
     * Keeper calls
     */
    function checkUpkeep(bytes calldata checkData) public view returns(bool, bytes memory) {
        // Check the block number target for ~ 5 min intervals

        //return(block.number % blocksPerFiveMinutes == 0, bytes(""));

        return(block.number - lastBlockNumberKeeper > KEEPER_UPDATE_NUM_BLOCKS, bytes(""));
        
    }

    function performUpkeep(bytes calldata performData) external {
        // Call requestNestData for each of our participants
        emit RequestingNestData(participants.length);
        for (uint256 i = 0; i < participants.length; i++) {
            requestGoogleNestData(participants[i]);
        }
    }

    function getTotalSavings() external returns (uint256) {

    }

    function getTotalSavingsThisCycle() external returns (uint256) {
        return userAddressToEnergyCountCycle[msg.sender];
    }

    function disablePact() external {
        userAddressToPactState[msg.sender] = PactState.Disabled;
    }

    function enablePact() external {
        userAddressToPactState[msg.sender] = PactState.Idle;
    }

    function requestPayout() external {

    }

    /**
     * @dev
     * Create a Chainlink request to retrieve Nest data for a user
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestGoogleNestData(address user) public returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(nestJobId, address(this), this.fulfillNestRequest.selector);
        req.add("user", addressToString(user));
        req.addUint("timestamp", block.timestamp);
        // Sends the request
        bytes32 _requestId = sendChainlinkRequestTo(nestOracle, req, nestFee);
        requestIdToUserAddress[_requestId] = user;
        return _requestId;
    }

    /**
     * @dev
     * Receive the response in the form of bytes32
     * `${thermostatInfo.mode},${thermostatInfo.temperature},${thermostatInfo.heatSetpoint},${thermostatInfo.coolSetpoint}`
     */
    function fulfillNestRequest(bytes32 requestId, bytes32 responseData) public recordChainlinkFulfillment(requestId)
    {

        string memory s = bytes32ToString(responseData);
        string[] memory splitResults;
        splitResults = stringSplit(s, ",");

        // temp variables required for converting to uint
        // EA format
        // data: `${thermostatInfo.mode},${thermostatInfo.temperature},${thermostatInfo.heatSetpoint},${thermostatInfo.coolSetpoint}`
        address userAddress;
        uint mode;
        uint temperature;
        uint heatSetpoint;
        uint coolSetpoint;
        userAddress = requestIdToUserAddress[requestId];
        // userAddress = address(uint160(uint256(stringToBytes32(splitResults[0]))));
        mode = stringToUint(splitResults[0]);
        temperature = stringToUint(splitResults[1]);
        heatSetpoint = stringToUint(splitResults[2]);
        coolSetpoint = stringToUint(splitResults[3]);
        
        // Store information as a struct for user
        require(userAddress != address(0), "Invalid address");
        userAddressToNestData[userAddress].push(NestData(mode, temperature, heatSetpoint, coolSetpoint));


        // Check if we should call the EIA update
        // Easier to do this here so so we don't have to pass user address to EIA fulfill
        if (block.number - lastBlockNumberEIA > EIA_UPDATE_NUM_BLOCKS) {
            bytes32 requestIdRegion0 = requestDataEIA(0);

            // No further action if pact is disabled
            if (pactState == PactState.Disabled) {
                return;
            }

            // No fruther action if no demand data yet
            uint256 demandDataLength = regionToDemandData[0].length;
            if (demandDataLength == 0) {
                return;
            }
            
            // If the latest demand data is greater than the threshold
            if (regionToDemandData[0][demandDataLength-1] > demandThreshold) {
                if (userAddressToPactState[userAddress] != PactState.Disabled) {
                    
                    uint256 nestDataArrayLength = userAddressToNestData[userAddress].length;
                    // No nest data yet
                    if (nestDataArrayLength == 0) {
                        return;
                    }
                    // Check if user is within set points
                    if (userAddressToNestData[userAddress][nestDataArrayLength-1].heatSetpoint <= demandHeatSetpoint && 
                        userAddressToNestData[userAddress][nestDataArrayLength-1].coolSetpoint >= demandCoolSetpoint) {
                        userAddressToEnergyCountCycle[userAddress]++;
                        userAddressToComplianceData[userAddress].push(1);
                    } else {
                        userAddressToComplianceData[userAddress].push(0);
                        // TODO: Send command to control nest to set points
                    }
                }
            }
        }
        lastBlockNumberEIA = block.number;
        lastBlockNumberKeeper = block.number;

        // TODO: Check the score for this user
       
        // TODO: Check if we need to update EIA Temperature
    }

   /**
     * Request demand data in megawatthours of a specific region
     */
    function requestDataEIA(uint256 region_num) public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(EIAJobId, address(this), this.fulfillEIA.selector);
        
        //if (region_num == 1) {
        // California
        request.add("get", "https://api.eia.gov/series/?series_id=EBA.CAL-ALL.D.HL&api_key=6eb4a901178943422d098f04d025be8c&num=1");

        /*
        } else if (region_num == 2) {
            // Carolinas
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.CAR-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 3) {
            // Central
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.CENT-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 4) {
            // Florida
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.FLA-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 5) {
            // Mid-Atlantic
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.MIDA-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 6) {
            // Midwest
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.MIDW-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 7) {
            // New England
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.NE-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");            
        } else if (region_num == 8) {
            // New York
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.NY-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 9) {
            // Northwest
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.NW-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 10) {
            // Southeast
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.SE-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 11) {
            // Southwest
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.SW-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 12) {
            // Tennessee
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.TEN-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
        } else if (region_num == 13) {
            // Texas
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.TEX-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");            
        }
        */ 
        request.add("path", "series.0.data.0.1");
       
        // Sends the request
        return sendChainlinkRequestTo(EIAOracle, request, EIAFee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfillEIA(bytes32 _requestId, uint256 _demand) public recordChainlinkFulfillment(_requestId)
    {
        regionToDemandData[0].push(_demand);

    }

    function stringToBytes32(string memory source) private pure returns (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly { // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }

    function bytes32ToString(bytes32 _bytes32) public pure returns (string memory) {
        return string(abi.encodePacked(_bytes32));
    }

    function stringToUint(string memory s) public pure returns (uint result) {
        bytes memory b = bytes(s);
        uint i;
        result = 0;

        for (i = 0; i < b.length; i++) {
            uint c = uint(uint8(b[i]));
            if (c >= 48 && c <= 57) {
                result = result * 10 + (c - 48);
            }
        }
    }

    function addressToString(address _address) public pure returns(string memory) {
        bytes32 _bytes = bytes32(uint256(uint160(_address)));
        bytes memory HEX = "0123456789abcdef";
        bytes memory _string = new bytes(42);
        _string[0] = '0';
        _string[1] = 'x';
        for(uint i = 0; i < 20; i++) {
            _string[2+i*2] = HEX[uint8(_bytes[i + 12] >> 4)];
            _string[3+i*2] = HEX[uint8(_bytes[i + 12] & 0x0f)];
        }
        return string(_string);
    }

    /**
     * Index Of
     *
     * Locates and returns the position of a character within a string starting
     * from a defined offset
     * 
     * @param _base When being used for a data type this is the extended object
     *              otherwise this is the string acting as the haystack to be
     *              searched
     * @param _value The needle to search for, at present this is currently
     *               limited to one character
     * @param _offset The starting point to start searching from which can start
     *                from 0, but must not exceed the length of the string
     * @return int The position of the needle starting from 0 and returning -1
     *             in the case of no matches found
     */
    function _indexOf(string memory _base, string memory _value, uint _offset)
        internal
        pure
        returns (int) {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        assert(_valueBytes.length == 1);

        for (uint i = _offset; i < _baseBytes.length; i++) {
            if (_baseBytes[i] == _valueBytes[0]) {
                return int(i);
            }
        }

        return -1;
    }

    function stringSplit(string memory _base, string memory _value)
        internal
        pure
        returns (string[] memory splitArr) {
        bytes memory _baseBytes = bytes(_base);

        uint _offset = 0;
        uint _splitsCount = 1;
        while (_offset < _baseBytes.length - 1) {
            int _limit = _indexOf(_base, _value, _offset);
            if (_limit == -1)
                break;
            else {
                _splitsCount++;
                _offset = uint(_limit) + 1;
            }
        }

        splitArr = new string[](_splitsCount);

        _offset = 0;
        _splitsCount = 0;
        while (_offset < _baseBytes.length - 1) {

            int _limit = _indexOf(_base, _value, _offset);
            if (_limit == - 1) {
                _limit = int(_baseBytes.length);
            }

            string memory _tmp = new string(uint(_limit) - _offset);
            bytes memory _tmpBytes = bytes(_tmp);

            uint j = 0;
            for (uint i = _offset; i < uint(_limit); i++) {
                _tmpBytes[j++] = _baseBytes[i];
            }
            _offset = uint(_limit) + 1;
            splitArr[_splitsCount++] = string(_tmpBytes);
        }
        return splitArr;
    }



}

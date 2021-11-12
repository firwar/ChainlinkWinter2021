// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GoogleNestClient is Ownable, ChainlinkClient {

    // Chainlink Stuff
    address private oracle;
    // bytes32 private jobId;
    uint256 private fee;

    bytes32 public data;

    /**
    * ExternalAdapter
    * Network: Kovan
    * Oracle: 0xaa6a3E85946644Fb0B6DB11EfEF2E608EbE521B5
    * Job ID: 27bc5a4660ec47c79e5be274c4a41a8f
    * Fee: 0.1 LINK
    * https://github.com/tweether-protocol/tweether/blob/master/contracts/Tweether.sol#L69
    */
    constructor () public {
        setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
        oracle = 0xa94fcD7aaeD52a5D8a525319B16b4d3296a02F6A;
        // jobId = "39ae9251d4e24785b0ee95b1bee7b8e6";
        fee = 0.1 * 10 ** 18; // 0.1 LINK

    }

    function addressToString(address _address) public pure returns (string memory _uintAsString) {
        uint _i = uint256(_address);
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev
     * Create a Chainlink request to retrieve API response, find the target
     * data, then multiply by 1000000000000000000 (to remove decimal places from data).
     */
    function requestGoogleNestData(address user, uint timestamp, string memory jobId) public returns (bytes32 requestId)
    {
        Chainlink.Request memory req = buildChainlinkRequest(stringToBytes32(jobId), address(this), this.fulfill.selector);
        req.add("user", addressToString(user));
        req.addUint("timestamp", timestamp);
        // Sends the request
        return sendChainlinkRequestTo(oracle, req, fee);
    }

    /**
     * @dev
     * Receive the response in the form of uint256
     */
    function fulfill(bytes32 requestId, bytes32 responseData) public recordChainlinkFulfillment(requestId)
    {
        data = responseData;
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
}

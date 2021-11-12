// SPDX-License-Identifier: MIT
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./Pact.sol";

// This is the main building block for smart contracts.
contract Gateway is Ownable{

    // Use counter to track all ids
    using Counters for Counters.Counter;

    // Holdd all our pacts
    address [] public pacts;

    // Counter for how many pacts we've created
    Counters.Counter private _numOfPacts;

    // Pact creation event
    event PactCreated(address user, address pact);

    constructor() public {
        // Always create a dummy one for 0 index
        pacts.push(address(0));
        _numOfPacts.increment();
    }


    function getAllPacts() external view returns (address[] memory) {
        
        // Allocate new array for the pact list
        address[] memory allPacts = new address[](_numOfPacts.current());

        for (uint i = 0; i<_numOfPacts.current(); i++) {
            // Start at +1 because of dummy
            allPacts[i] = pacts[i+1];
        }
        return allPacts;
    }

    /*
     * Seller facing methods
     */
    function createPact(string memory nestId, uint256 region) external payable {

        // Create a Listing
        Pact pact = new Pact(

        );

        // Emit event
        emit PactCreated(msg.sender, address(pact));
    }


}

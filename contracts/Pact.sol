// SPDX-License-Identifier: MIT
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// This is the main building block for smart contracts.
contract Pact is Ownable{

    constructor() public {
        // Always create a dummy one for 0 index
    }

}

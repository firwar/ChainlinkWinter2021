// SPDX-License-Identifier: MIT
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

// This is the main building block for smart contracts.
contract Gateway is Ownable{

    // Use SafeMath because its safe
    using SafeMath for uint256;
    // Use counter to track all ids
    using Counters for Counters.Counter;

    constructor() public {
        // Always create a dummy one for 0 index
    }
}

// SPDX-License-Identifier: MIT
// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// This is the main building block for smart contracts.
contract Pact is Ownable{

    enum PactState { Disabled, Idle, Running }


    uint256 public energyCountCycle;
    uint256 public energyCountTotal;

    // The energy count for each cycle
    mapping (uint256 => uint256) private cycleToEnergyCount; 

    constructor() public {
        // Always create a dummy one for 0 index
    }


    function startNewCycle() external {

    }

    function changeConditions(uint256 demandThreshold) external {

    }

    function terminatePact() external {

    }

    /*
     * Periodic contract calls
     */

    function checkEnergyStatusAndTrigger() external {
    
    }

    function checkComplianceAndReward() external {

    }


    function getTotalSavings() external returns (uint256) {

    }

    function getTotalSavingsThisCycle() external returns (uint256) {

    }

    function getSavingsAllCycles() external returns (uint256[] memory) {

    }


    function disablePact() external {

    }

    function enablePact() external {

    }

    function requestPayout() external {

    }
}

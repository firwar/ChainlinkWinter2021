// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * THIS IS AN EXAMPLE CONTRACT WHICH USES HARDCODED VALUES FOR CLARITY.
 * PLEASE DO NOT USE THIS CODE IN PRODUCTION.
 */
contract EIAAPIConsumer is ChainlinkClient {
    using Chainlink for Chainlink.Request;
  
    uint256 public volume;
    
    address private oracle;
    bytes32 private jobId;
    uint256 private fee;
    
    /**
     * Network: Kovan
     * Oracle: 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8 (Chainlink Devrel   
     * Node)
     * Job ID: d5270d1c311941d0b08bead21fea7747
     * Fee: 0.1 LINK
     */
    constructor() {
        setPublicChainlinkToken();
        oracle = 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8;
        jobId = "d5270d1c311941d0b08bead21fea7747";
        fee = 0.1 * 10 ** 18; // (Varies by network and job)
    }
    
    /**
     * Request demand data in megawatthours of a specific region
     */
    function requestDemandData(uint256 region_num) public returns (bytes32 requestId) 
    {
        Chainlink.Request memory request = buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        
        
        if (region_num == 1) {
            // California
            request.add("get", "https://api.eia.gov/series/?series_id=EBA.CAL-ALL.D.HL&api_key=4b97470094bf5cb0fb2e0bd02c776837&num=1");
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
        
        request.add("path", "series.0.data.0.1");
        
        // Sends the request
        return sendChainlinkRequestTo(oracle, request, fee);
    }
    
    /**
     * Receive the response in the form of uint256
     */ 
    function fulfill(bytes32 _requestId, uint256 _volume) public recordChainlinkFulfillment(_requestId)
    {
        volume = _volume;
    }

    // function withdrawLink() external {} - Implement a withdraw function to avoid locking your LINK in the contract
}

EnergyLink is a blockchain energy saving IoT platform that leverages power grid demand data and controls residential smart thermostats all through Chainlink External Adapters. 

We created a campaign through smart contracts for power companies to deposit a fund that gets distributed to users after a set duration if they save a certain threshold of energy. The contract uses Google Nest APIs with External Adapters to read and control Nest Thermostats, US Department of energy EIA Data with External Adapter, Google Weather Oracle, and the Keeper's Network.

Live Dapp Demo: (Kovan)
[Insert Link to Dapp]

Demo Video:
[Insert Video]

# Overview

With the global environment deteriorating everyday, it has become more and more important to conserve our natural resources and reduce pollution to the environment through the saving of energy. To promote and motivate the general public to conserve energy we use blockchain to gamify and provide transparency in a reward based IoT platform. This platform leverages government energy data via Chainlink to optimize energy savings.

# Solution
In EnergyLink, this smart contract is deployed by a power company or government body for its customers, for example this could be the Los Angeles Department of Water and Power. Customers that have a smart thermostat (i.e. Google Nest) can join this contract, giving control of their thermostat, and transparently earn rewards.

![alt text](EnergyLinkBlockDiagram.jpg)

The overall flow is the following:
1. Power company or department of energy deploys and funds EnergyLink contract
2. Customer joins smart contract and provides their Google Nest information via Oauth and their location region
3. Firebase database stores Nest thermostat authentication information
4. Smart contract is periodically called by Chainlink Keeper
5. Upon keeper call, contract queries US Department of Energy data through Chainlink Oracle to get current energy usage in the customer’s location region
6. If energy usage is above a threshold, command is sent via custom Google Nest Chainlink EA to control user’s Nest to reduce thermostat settings
7. User’s Nest is periodically checked via Google Nest Chainlink EA, if they are within temperature setting limits the user’s reward increases
8. User can track their statistics / rewards and how their saving compare against others
9. User can request payout after their reward passes a certain threshold

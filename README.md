# About the Project
This project is a simulation on a bank's queueing system.

# Simulation Flow

### 1. Generate a singular customer object based on a rate constantly
- The customer object demographic is randomized based on probability
- The customer object state upon arrival is randomized based on a probability

### 2. Assign customer to its appropriate state queue array (any of the 5 routes) based on their state after generation

### 3. [Arrival Route 01] Customer in ATM Coins Queue
- Customer gets appended to the station queue
- If any one of the equipment is empty, then the first customer of the queue gets to use it.
- Equipment is marked as occupied
- When using, there is a running timer of how long the customer is able to use it (additional demographic time + average time)
- When timer runs to 0, customer has his dwell time calculated, and is marked with a state EXIT
- Then the equipment is marked as vacant
- Dwell time is included in the constant averaging of dwell times per demographic
NOTE: Shifting of customers from station queue to vacant equipment should happen simultaneously, so if there are 2 equipments vacant, then 2 customers can use both simultaneously.

### 4. [Arrival Route 02] Customer in ATMs Queue -> Same Logic as Route 01

### 5. [Arrival Route 03] Customer in VTMs Queue -> Same Logic as Route 01

### 6. [Arrival Route 04] Customer in Main Queue
- Customer gets sent to the main queue
- Customer changes state based from the function returnResultBasedOnProb(StateFromMainQueueProb)
- From the result of the previous step, the customer can go into 2 routes: the first route being the State.QUEUE_MANAGER_DISCUSSION or State.EXIT

Situation A: If the customer is in the State.EXIT state, then the function updateCustomerDwellTimeAndExitSimulation(customer) runs. This is when a customer drops out after a random time. 

Situation B: If the customer is in the State.QUEUE_MANAGER_DISCUSSION state, then he changes state to State.QUEUE_MANAGER_DISCUSSION and gets appended to the mainQueue array. These customers will have to be accommodated one at a time, via a countdown timer (via distribution) for each customer. A customer can only be served after the previous one ahead is finished, and if there is no ongoing countdown timer in the EventState.QUEUE_MANAGER_REQUIRES_ASSISTANCE as the queue manager is pre-occupied. From here, a further of any of the following 4 routes can happen based from the function returnResultBasedOnProb(StateFromQueueManagerDiscussionProb).

Case 01: EventState.QUEUE_MANAGER_DIRECTS
- The customer will be assigned to any of the 5 stations using a probability (returnResultBasedOnProb(StateFromQueueManagerDirectsProb)) using stationManager.appendCustomerToStationQueue(Station.[STATION_NAME], customer).

Case 02: EventState.QUEUE_MANAGER_REQUIRES_ASSISTANCE
- Assistance time is from the distribution.
- The customer will then further change into either 1 of two states using returnResultBasedOnProb(StateFromQueueManagerRequiresAssistanceProb). The switch statement will have 2 states, the first being EventState.QUEUE_MANAGER_DIRECTS, where the function of case 01 will be applied. The second will be State.EXIT running the function updateCustomerDwellTimeAndExitSimulation(customer).

Case 03: EventState.CUSTOMER_MISSING_DOCUMENTS
- The customer will then further change into either 1 of two states using returnResultBasedOnProb(StateFromCustomerMissingDocumentsProb). The switch statement will have 2 states, the first being State.RETURN_LATER_QA, where the state of the customer gets appended to the 'returnLaterQueueAgainQueue' array from the returnLaterQueueAgainManager class. The second will be State.EXIT running the function updateCustomerDwellTimeAndExitSimulation(customer)

Case 04: State.EXIT
- Run function updateCustomerDwellTimeAndExitSimulation(customer)

### 7. [Arrival Route 05] Customer in Return Later Queue Number (Digital Queue)
- Customer gets digital queue number and can either go to one of two paths
- Route 01: Come back later and joins the counters queue (in conjunction with the physical queue) 
- Route 02: Misses the queue number

If route 02 happens and the customer misses their queue number, they can either exit the simulation or re-queue to get a new number.

### 8. [***Arrival Route 06] Customer Re-queues in Main Queue from Home
- The customers that missed their documents will have their state changed to be State.RETURN_LATER_QA, and will be appended to another array called returnLaterQueueAgainQueue from a class manager
- Each customer has a different time interval in which they will be appended back to the mainQueue depending on the randomization from the range function returnResultBasedOnRange(RETURN_LATER_QUEUE_AGAIN_RANGE)
- Customers in this queue are appended back in order of their intervals (shortest intervals are processed first)



# Effects of Solutions to the Base Model

### 1. Shared Database
- Parameters Affected: Reduce Arrival Rate
- How to Implement: Toggling this option will automatically reduce the arrival rate by 16.67% based from the original 0.012 from data collection. 
Therefore the arrival rate will be 0.012 * 0.8333 = 0.010.

Rationale for adjusting the probability by 16.67%%:
- Assuming that 7 people came from call center phone calls that didn't address their question: (36/43) * 0.012 = 0.0100 
- Percentage Decrease: [(0.012 - 0.010) / 0.012] * 100 = 16.67%

### 2. Education of Staff
- Parameters Affected: Remove Assistance Route, Solving Issue Probability / Directing Route is Higher
- How to Implement: 
1. Remove Assistance Route
2. Probability of Solving Issue Successfully Increases: From 0.047 -> 0.056, 
3. Probability of Directing to Correct Station Increases: From 0.767 -> 0.921

Rationale for Adjusting Probabilities to Remove Requires Assistance Route:
- Current Probabilities of 4 Routes - Require Assistance: 0.163, Solves Issue: 0.047, Directs to Correct Station: 0.767, Missing Documents: 0.023
- Missing Documents Probability: Always Remains the Same 0.023 (Assumption)
- Probability Left = 1 - 0.023 = 0.977
- Adjusted Solves Issue Successfully: From 0.047 -> 0.056 (Equation: [0.047 / (0.047 + 0.767)] * 0.977)
- Adjusted Directed to Correct Station: From 0.767 -> 0.921 (Equation: 0.977 - 0.056)

### 3. Remove VTM Need for Verification
- Parameters Affected: Reduced Station Time for VTM, Reduced Station Time for App Booth
- How to Implement: 
1. Reduce VTM Average Time from 516 seconds -> 201.36 (round down to 201) seconds
2. Staff can be allocated to an additional app booth, so instead of 2 app booths there are now 3

Rationale for Adjusting the Average Times:
1. It takes an average of 314.64 seconds for a personnel to do a second verification and assist in the VTM machine
2. With an additional app booth, the rate of people coming in to get app booth assistance will increase by 50%% therefore clearing the queue faster.
- Current Rate: 10/3600 = 0.00278
- Increased Rate: 15/3600 = 0.00417 (Increased Service Rate = Decrease in Dwell Time)
- Increase by [(0.00417 - 0.00278) / 0.00278] * 100 = 50.00% increase

### 4. Better Methods for Prevention of Errors in Common Online Customer Actions
- Parameters Affected: Remove Missing Documents Route, Increase Probability for the Other Routes, Decrease Arrival Rate
- How to Implement:
1. Remove the Missing Documents Route
2. Probability of Solving Issue Successfully Increases: From 0.047 -> 0.048
2. Probability of Directing to Correct Station Increases: From 0.767 -> 0.785
3. Probability of Asking for Assistance Increases: From 0.163 -> 0.167
4. Decrease in arrival rate by 8.33%

Rationale for Adjusting Probabilities to Remove the Missing Documents Route:
- Current Probabilities of 4 Routes - Require Assistance: 0.163, Solves Issue: 0.047, Directs to Correct Station: 0.767, Missing Documents: 0.023
- Adjusted Solving Issue Successfully: From 0.047 -> 0.048 (Equation: [0.047 / (0.047 + 0.767 + 0.163)])
- Adjusted Directing to Correct Station: From 0.767 -> 0.785 (Equation: [0.767 / (0.047 + 0.767 + 0.163)])
- Adjusted Asking for Assistance: From 0.163 -> 0.167 (Equation: [1 - 0.048 - 0.785])

Rationale for Adjusting Arrival Rate by 8.33%%:
- Previously, in 1hr there is an average of 43 people who arrive, with 2 people missing documents. Now there is only 41 people arriving in an hour.
- New Arrival Rate: 41/3600 = 0.011 person/sec
- Percentage Decrease: [(0.012 - 0.011) / 0.012] * 100 = 8.33%
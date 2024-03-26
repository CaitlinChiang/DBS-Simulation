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

Situation B: If the customer is in the State.QUEUE_MANAGER_DISCUSSION state, then he changes state to State.QUEUE_MANAGER_DISCUSSION and gets appended to the mainQueue array. These customers will have to be accommodated one at a time, via a countdown timer (via distribution) for each customer. A customer can only be served after the previous one ahead is finished, and if there is no ongoing countdown timer in the EventState.QUEUE_MANAGER_REQUIRES_ASSISTANCE as the queue manager is pre-occupied. From here, a further of any of the following 4 routes can happen based from the function returnResultBasedOnProb(StateFromQueueManagerDiscussionResultProb).

Case 01: EventState.QUEUE_MANAGER_DIRECTS
- The customer will be assigned to any of the 5 stations using a probability (returnResultBasedOnProb(StateFromQueueManagerDirectProb)) using stationManager.appendCustomerToStationQueue(Station.[STATION_NAME], customer).

Case 02: EventState.QUEUE_MANAGER_REQUIRES_ASSISTANCE
- Assistance time is from the distribution.
- The customer will then further change into either 1 of two states using returnResultBasedOnProb(StateFromQueueManagerRequiresAssistanceProb). The switch statement will have 2 states, the first being EventState.QUEUE_MANAGER_DIRECTS, where the function of case 01 will be applied. The second will be State.EXIT running the function updateCustomerDwellTimeAndExitSimulation(customer).

Case 03: EventState.CUSTOMER_MISSING_DOCUMENTS
- The customer will then further change into either 1 of two states using returnResultBasedOnProb(StateFromMissingDocumentsProb). The switch statement will have 2 states, the first being State.RETURN_LATER_QA, where the state of the customer gets appended to the 'returnLaterQueueAgainQueue' array from the returnLaterQueueAgainManager class. The second will be State.EXIT running the function updateCustomerDwellTimeAndExitSimulation(customer)

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



# General TTD:
[] Review & Cleanup Code + Lint
[] Link all components
[] The functions of updateStationEquipment and shiftCustomerFromStationQueueToVacantEquipment should be running repeatedly (always running)
[] The functions of updateQueueManagerInfo and handleQueueManagerDiscussion should be running repeatedly (always running)
[] The function of processCustomersFromReturnLaterQueueAgainQueue should be running repeatedly (always running)
[] Fix timer of countdowns

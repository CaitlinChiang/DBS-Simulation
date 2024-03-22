# Simulation Flow

1. Generate a singular customer object based on a rate constantly
- The customer object demographic is randomized based on probability
- The customer object state upon arrival is randomized based on a probability

2. Assign customer to its appropriate state queue array (any of the 5 routes) based on their state after generation

TODO:
- main queue manager class route for the logic 
- return later from digital scanning to counters mixed queue

3. [Arrival Route 01] Customer in ATM Coins Queue
- Customer gets appended to the station queue
- If any one of the equipment is empty, then the first customer of the queue gets to use it.
- Equipment is marked as occupied
- When using, there is a running timer of how long the customer is able to use it (additional demographic time + average time)
- When timer runs to 0, customer has his dwell time calculated, and is marked with a state EXIT
- Then the equipment is marked as vacant
- Dwell time is included in the constant averaging of dwell times per demographic
*** NOTE: This should happen simultaneously, so if there are 2 equipments vacant, then 2 customers can use both simultaneously.

4. [Arrival Route 02] Customer in ATMs Queue -> Same Logic as Route 01

5. [Arrival Route 03] Customer in VTMs Queue -> Same Logic as Route 01

6. [Arrival Route 04] Customer in Main Queue

7. [Arrival Route 05] Customer in Return Later Queue Number (Digital Queue)
- 



# General TTD:
1. 
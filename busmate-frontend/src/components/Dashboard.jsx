import { Box, Grid, GridItem } from "@chakra-ui/react";
import LiveBusMap from "./LiveBusMap";
import LiveDriverLocation from "./LiveDriverLocation";

const Dashboard = () => {
    // TODO: Make driverId dynamic
    const driverId = "driver_001";

    return (
        <Grid templateColumns={{ base: "1fr", md: "300px 1fr" }} gap={4} p={4} h="calc(100vh - 80px)">
            <GridItem w="100%" h="100%" overflowY="auto" borderRight={{ md: "1px solid" }} borderColor="gray.200">
                <LiveDriverLocation driverId={driverId} />
            </GridItem>
            <GridItem w="100%" h="100%">
                <LiveBusMap driverId={driverId} />
            </GridItem>
        </Grid>
    );
};

export default Dashboard;

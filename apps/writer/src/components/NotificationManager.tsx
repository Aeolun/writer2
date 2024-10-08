import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Alert,
  AlertIcon,
  CloseButton,
  VStack,
  Text,
} from "@chakra-ui/react";
import { RootState } from "../lib/store";
import { removeNotification } from "../lib/slices/notifications";

export const NotificationManager: React.FC = () => {
  const notifications = useSelector(
    (state: RootState) => state.notifications.notifications,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    for (const notification of notifications) {
      // Only set a timer for non-error notifications
      if (notification.type !== "error") {
        const timer = setTimeout(() => {
          dispatch(removeNotification(notification.id));
        }, 5000);
        timers.push(timer);
      }
    }

    return () => {
      for (const timer of timers) {
        clearTimeout(timer);
      }
    };
  }, [notifications, dispatch]);

  return (
    <Box position="fixed" top={4} right={4} zIndex={9999}>
      <VStack spacing={2} align="stretch">
        {notifications.map((notification) => (
          <Alert key={notification.id} status={notification.type} pr={8}>
            <AlertIcon />
            <Box flex="1" mr={2}>
              <Text>{notification.message}</Text>
              {notification.details &&
                Object.keys(notification.details).length > 0 && (
                  <Box mt={2}>
                    {Object.entries(notification.details).map(
                      ([field, errors]) => (
                        <Text key={field} fontSize="sm" color="red.500">
                          {field}: {errors.join(", ")}
                        </Text>
                      ),
                    )}
                  </Box>
                )}
            </Box>
            <CloseButton
              position="absolute"
              right={1}
              top="50%"
              transform="translateY(-50%)"
              onClick={() => dispatch(removeNotification(notification.id))}
            />
          </Alert>
        ))}
      </VStack>
    </Box>
  );
};

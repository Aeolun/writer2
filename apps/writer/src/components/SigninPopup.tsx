import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { globalActions } from "../lib/slices/global";
import type { RootState } from "../lib/store";
import { useForm } from "react-hook-form";
import { reloadTrpc, trpc } from "../lib/trpc";
import { settingsStore } from "../global-settings-store";

export const SigninPopup = () => {
  const dispatch = useDispatch();
  const { register, handleSubmit } = useForm<{
    clientName: string;
    email: string;
    name: string;
    password: string;
    signInEmail: string;
    signInPassword: string;
  }>();
  const [isRegistered, setIsRegistered] = React.useState(false);

  const isOpen = useSelector((state: RootState) => state.base.signinPopupOpen);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        dispatch(globalActions.setSigninPopupOpen(false));
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Register / Sign-in</ModalHeader>
        <ModalBody>
          <Text mb={1}>
            If you want to sync your story using our servers, you can sign in or
            register here.
          </Text>
          <Text mb={1}>
            This is also necessary if you want to publish your story to the
            public <i>reader</i> application. It's <strong>not</strong>{" "}
            necessary if you want to publish to other services supported by{" "}
            <i>writer</i> (e.g. Royalroad).
          </Text>
          <Text mb={1}>
            You have to only sign-in once per writer instance. Once you sign in
            a token is generated that writer will thereafter use for
            communication.
          </Text>
          <Tabs isFitted>
            <TabList>
              <Tab>Sign in</Tab>
              <Tab>Register</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <Heading size="md">Sign in</Heading>
                <form
                  onSubmit={handleSubmit((data) => {
                    trpc.login
                      .mutate({
                        email: data.signInEmail,
                        password: data.signInPassword,
                        description: data.clientName,
                      })
                      .then((result) => {
                        settingsStore
                          .set("client-token", result)
                          .catch((error) => {
                            console.error("Failed to save client token", error);
                          })
                          .then(async () => {
                            await reloadTrpc();
                            const res = await trpc.whoAmI.query();
                            dispatch(
                              globalActions.setSignedInUser(res ?? undefined),
                            );
                          });

                        dispatch(globalActions.setSigninPopupOpen(false));
                      });
                  })}
                >
                  <FormControl>
                    <FormLabel>Client name</FormLabel>
                    <Input type="text" {...register("clientName")} />
                    <FormHelperText>
                      This is the name of the device you are using. It can be
                      anything you want.
                    </FormHelperText>
                  </FormControl>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input type="email" {...register("signInEmail")} />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Password</FormLabel>
                    <Input type="password" {...register("signInPassword")} />
                  </FormControl>
                  <Button type="submit">Sign in</Button>
                </form>
              </TabPanel>
              <TabPanel>
                <Heading size="md">Register</Heading>

                {isRegistered ? (
                  <Box>Thank you for registering, please sign-in now.</Box>
                ) : (
                  <form
                    onSubmit={handleSubmit((data) => {
                      trpc.register
                        .mutate({
                          email: data.email,
                          name: data.name,
                          password: data.password,
                        })
                        .then((result) => {
                          setIsRegistered(true);
                        });
                    })}
                  >
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input type="text" {...register("name")} />
                      <FormHelperText>
                        This is the name that will be displayed to other users.
                      </FormHelperText>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Email</FormLabel>
                      <Input type="email" {...register("email")} />
                      <FormHelperText>
                        This is the email that will be used for communication.
                        Never shown to other users.
                      </FormHelperText>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Password</FormLabel>
                      <Input type="password" {...register("password")} />
                      <FormHelperText>
                        This is the password you will use to sign in.
                      </FormHelperText>
                    </FormControl>
                    <Button type="submit">Register</Button>
                  </form>
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

import { SmallAddIcon } from "@chakra-ui/icons";
import {
  Text,
  Avatar,
  VStack,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Switch,
  Button,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  PinInput,
  PinInputField,
  useToast,
  CircularProgress,
  CircularProgressLabel,
  Flex,
  Box,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserStats from "./Stats";
export interface Profile {
  imgPdp: string;
  nickname: string;
  isTwoFA: boolean;
}

export default function Settings(props: any) {
  var formData = new FormData();
  const [profile, setProfile] = useState<Profile>({
    imgPdp: props.user.imgPdp,
    nickname: "",
    isTwoFA: false,
  });

  const [profilePreview, setPreview] = useState("");
  const [selectedFile, setSelectedFile] = useState();
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, nickname: event.target.value });
  };

  const handleAvatarChange = async (event: any) => {
    const file = event.currentTarget.files[0];
    setSelectedFile(event.currentTarget.files[0]);
    setPreview(URL.createObjectURL(file));
  };

  useEffect(() => {
    if (profilePreview) {
      if (selectedFile) formData.append("file", selectedFile);
    }
  }, [profilePreview]);

  const SendModif = async (event: any) => {
    event.preventDefault();
    try {
      await axios.post(
        import.meta.env.VITE_BACKEND + "/user/avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );
    } catch (error) {}
    try {
      await axios.post(
        import.meta.env.VITE_BACKEND + "/user/settings",
        {
          nickname: profile.nickname,
        },
        { withCredentials: true }
      );
    } catch (error) {}
    window.location.reload();
  };

  const [isChecked, setIsChecked] = useState(false);
  const [qrCode, setQrcode] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [pinCode, setPinCode] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const res = await axios.get(import.meta.env.VITE_BACKEND + "/api/user", {
        withCredentials: true,
      });
      setProfile(res.data.user);
      setPreview(res?.data?.user?.imgPdp);
      sessionStorage.setItem("currentUser", JSON.stringify(res.data.user));
    };
    getUser();
    if (profile.isTwoFA) setIsChecked(true);
  }, [profile.isTwoFA, isChecked]);

  async function handleCheck2FA() {
    if (profile.isTwoFA) {
      await axios.post(
        import.meta.env.VITE_BACKEND + "/api/turn-off" + location.search,
        {
          twoFACode: pinCode,
        },
        { withCredentials: true }
      );
      setIsChecked(false);
    } else {
      const resp: any = await axios.get(
        import.meta.env.VITE_BACKEND + "/api/generate" + location.search,
        { withCredentials: true, responseType: "blob" }
      );
      const qrUrl = URL.createObjectURL(resp.data);
      setQrcode(qrUrl);
      onOpen();
    }
  }

  const toast = useToast();
  async function sendCode() {
    try {
      const resp = await axios.post(
        import.meta.env.VITE_BACKEND + "/api/turn-on" + location.search,
        {
          twoFACode: pinCode,
        },
        { withCredentials: true }
      );
      if (resp.data.status == 401) throw new Error("test");
      setIsChecked(true);
      toast({
        title: `2FA is now activate please log in again`,
        status: "success",
        isClosable: true,
        position: "top",
      });
      await axios.get(import.meta.env.VITE_BACKEND + "/api/logout", {
        withCredentials: true,
      });
      sessionStorage.removeItem("jwt");
      sessionStorage.removeItem("currentUser");
      onClose();
      navigate("/login");
    } catch (error) {
      toast({
        title: `invalid code`,
        status: "error",
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <VStack spacing={4} align="stretch">
      <FormControl>
          <Flex alignItems={"center"} flexDirection={"row"}>
            <VStack>
              <CircularProgress
                transform={"rotate(180deg)"}
                value={props?.user?.ratioToNextLevel}
                size={"3em"}
                color="teal.500"
                thickness={"15%"}
              >
                <CircularProgressLabel
                  transform={"rotate(0.5turn) translateX(50%) translatey(50%)"}
                >
                  <label htmlFor="avatar">
                    <Avatar
                      name={props.user?.nickname}
                      size={"2xl"}
                      src={profilePreview}
                    >
                      <SmallAddIcon
                        p="5px"
                        opacity={"80%"}
                        borderRadius={"100%"}
                        boxSize={"100%"}
                        _hover={{ opacity: "50%", cursor: "pointer" }}
                        color="gray.100"
                        position={"absolute"}
                      ></SmallAddIcon>
                    </Avatar>
                  </label>
                  <Box
                    as={"span"}
                    position={"absolute"}
                    left={"calc(50% - 15px)"}
                    bottom={"-15px"}
                    h={"20px"}
                    w={"30px"}
                    bg={"black"}
                    border={"2px"}
                    borderColor={"teal.500"}
                    borderRadius={"8px"}
                    zIndex={9999}
                    p={"1px"}
                    alignSelf={"center"}
                  >
                    <Text m="-1" fontSize={"1.5em"} color={"white"}>
                      {props?.user?.level}
                    </Text>
                  </Box>
                </CircularProgressLabel>
              </CircularProgress>
				<Box w={'95%'}>
              		<UserStats user={props.user} />
				</Box>
            </VStack>
          </Flex>
          <input
            hidden
            type="file"
            id="avatar"
            name="avatar"
            accept="image/*"
            placeholder="test"
            onChange={(event) => handleAvatarChange(event)}
          />
      </FormControl>
      <FormControl>
        <FormLabel>Name</FormLabel>
        <Input
          type="text"
          value={profile.nickname}
          onChange={handleNameChange}
          placeholder="Entrez votre nom"
        />
      </FormControl>
      <FormControl>
        <HStack justifyContent="space-between">
          <FormLabel>Two Factor Authentification (2FA)</FormLabel>
          {
            <Switch
              isChecked={isChecked}
              onChange={handleCheck2FA}
              colorScheme="teal"
              defaultChecked
            />
          }
        </HStack>
        <Modal onClose={onClose} isOpen={isOpen} isCentered>
          <ModalOverlay />
          <ModalContent alignItems={"center"}>
            <ModalHeader>Init 2FA</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Image src={qrCode} />
            </ModalBody>
            <ModalFooter>
              <VStack>
                <FormLabel>Verification code</FormLabel>
                <HStack>
                  <PinInput onChange={(e) => setPinCode(e)}>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                  <Button colorScheme="teal" onClick={sendCode}>
                    Verify
                  </Button>
                </HStack>
              </VStack>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </FormControl>
      <Button colorScheme="teal" type="submit" onClick={SendModif}>
        Enregistrer
      </Button>
    </VStack>
  );
}

import {Text, Box, Avatar, Badge , Flex, AvatarBadge } from "@chakra-ui/react";

export default function UserCard(props: any){
	return (

		<Flex alignItems={'center'} _hover={{ bg: 'gray.200', cursor : 'pointer'}} padding={'2'} w={'100%'} borderRadius={'8'}>
	<Avatar
		name={props.user.nickname}
		size="sm"
		src={props.user.imgPdp}>
		{props.user.isOnline &&
			<AvatarBadge boxSize='1em' bg='green.500' />
		}
		{!props.user.isOnline &&
			<AvatarBadge borderColor='papayawhip' bg='tomato' boxSize='1em' />
		}
	</Avatar>
	<Box ml='2'>
		<Text fontSize='sm' fontWeight='bold'>
			{props.user.nickname}
			{props.user.isOnline &&
				<Badge ml='1' colorScheme='green'>
					Online
				</Badge>
			}
			{!props.user.isOnline &&
				<Badge ml='1' colorScheme='red'>
					offline
				</Badge>
			}
			{props.user.isPlaying &&
				<Badge ml='1' colorScheme='purple'>
					ingame
				</Badge>
			}
		</Text>
		<Text fontSize='xs'>Student</Text>
	</Box>
</Flex>
)
}
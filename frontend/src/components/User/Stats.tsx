import axios from "axios"
import { useState, useEffect } from "react"
import { Box, CircularProgress, CircularProgressLabel, Text, VStack } from "@chakra-ui/react";
import { Chart, Line } from 'react-chartjs-2';
import { ChartOptions } from 'chart.js';


interface Stats {
	nbOfWin: number,
	nbOfLoose: number,
	nbOfGame: number,
	pointTab: number[],
	matchList: number[],
	oponentTab: number[],
	winrate: number,

}
export default function UserStat(props: any) {

	const [stats, setStats] = useState<Stats>({
		nbOfWin: 0,
		nbOfLoose: 0,
		nbOfGame: 0,
		pointTab: [],
		matchList: [],
		oponentTab: [],
		winrate: 0


	})
	useEffect(() => {
		try {
			const getHistory = async () => {
				try {
					const resp = await axios.get(
						import.meta.env.VITE_BACKEND + "/user/stats/" + props?.user?.id,
						{
							withCredentials: true,
						}
					);
					setStats(resp.data.stats);
				} catch (error) {
					//console.log("error", error);
				}
			};
			getHistory();
		} catch (error) {
			//console.log(error);
		}
	}, [props?.user?.id])


	const data = {
		labels: stats.matchList,
		datasets: [
			{
				label: 'Me',
				data: stats.pointTab,
				fill: false,
				borderColor: 'teal',
				tension: 0.1,
			},
			{
				label: 'Oponent',
				data: stats.oponentTab,
				fill: false,
				borderColor: 'red',
				tension: 0.1,
			},
		],
	};

	const options: Partial<ChartOptions<'line'>> = {
		scales: {
			y: {
				type: 'linear',
				beginAtZero: true,
			},
		},
	};

	return (
		<Box borderWidth='1px' borderRadius='lg' p={4} m={4}>
			<div>
				<Line data={data} options={options} />
			</div>
			<VStack>
				<Text>winrate</Text>
				<CircularProgress value={40} color='green.400'>
					<CircularProgressLabel>{stats.winrate} %</CircularProgressLabel>
				</CircularProgress>
			</VStack>
		</Box>
	)
}
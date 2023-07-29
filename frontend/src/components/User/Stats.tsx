import axios from "axios";
import { useState, useEffect } from "react";
import {
	Box,
	CircularProgress,
	CircularProgressLabel, Text,
	VStack,
	Wrap
} from "@chakra-ui/react";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { ChartOptions } from "chart.js";
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);

interface Stats {
	nbOfWin: number;
	nbOfLoose: number;
	nbOfGame: number;
	pointTab: number[];
	matchList: number[];
	oponentTab: number[];
	winrate: number;
}
export default function UserStats(props: any) {
	const [stats, setStats] = useState<Stats>({
		nbOfWin: 0,
		nbOfLoose: 0,
		nbOfGame: 0,
		pointTab: [],
		matchList: [],
		oponentTab: [],
		winrate: 0,
	});
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
				}
			};
			getHistory();
		} catch (error) {
		}
	}, [props?.user?.id]);

	const data = {
		labels: stats.matchList,
		datasets: [
			{
				label: "Me",
				data: stats.pointTab.reverse(),
				fill: false,
				borderColor: "teal",
				tension: 0.1,
			},
			{
				label: "Oponent",
				data: stats.oponentTab.reverse(),
				fill: false,
				borderColor: "red",
				tension: 0.1,
			},
		],
	};

	const options: Partial<ChartOptions<"line">> = {
		scales: {
			y: {
				type: "linear",
				beginAtZero: true,
			},
		},
	};

	const LineChart = () => (
		<Box w={'100%'}>
			<Line data={data} options={options} />
		</Box>

	);

	return (
		<VStack>
			<Box width={'95%'} m={3} >
				<Wrap borderWidth="1px" borderRadius="lg" flexDirection={'column'} alignItems={'center'}>
					<LineChart />
					<VStack>
						<Text>winrate</Text>
						<CircularProgress value={40} color="purple.400">
							<CircularProgressLabel>{stats.winrate} %</CircularProgressLabel>
						</CircularProgress>
					</VStack>
				</Wrap>
			</Box>
		</VStack>
	);
}

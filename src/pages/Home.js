import { useEffect, useState } from "react";

import Clock from "./Clock";

const remote = window.require("@electron/remote");
const { ipcRenderer } = window.require("electron");
const { BrowserWindow, dialog, Menu } = remote;
const shell = window.require("electron").shell;

export default function Home(props) {
	const [timerTime, setTimerTime] = useState(0);
	let seconds = ("0" + (Math.floor((timerTime / 1000) % 60) % 60)).slice(-2);
	let minutes = ("0" + Math.floor((timerTime / 60000) % 60)).slice(-2);
	let hours = ("0" + Math.floor((timerTime / 3600000) % 60)).slice(-2);
	const [font, setFont] = useState("digital");
	const [fontColor, setFontColor] = useState("white");
	const [backgroundColor, setBackgroundColor] = useState("black");
	const [fullscreen, setFullscreen] = useState(false);
	const [isClockOpen, setIsClockOpen] = useState(false);
	const [timerOn, setTimerOn] = useState(false);

	useEffect(() => {
		let listener = ipcRenderer.on("reset-timer-receive", (e, args) => {
			setTimerOn(args);
		});

		return () => ipcRenderer.removeListener("reset-timer-receive", listener);
	}, []);

	useEffect(() => {
		const keyEscape = window.addEventListener(
			"keydown",
			(e) => {
				if (e.key === "Escape") {
					setFullscreen(false);
					ipcRenderer.send("fullscreen-send", false);
				}
			},
			[]
		);

		return () => window.removeEventListener("keydown", keyEscape);
	}, []);

	useEffect(() => {
		let listener = ipcRenderer.on("close-clock", (e, arg) => {
			setIsClockOpen(false);
		});

		return () => ipcRenderer.removeListener("close-clock", listener);
	}, []);

	useEffect(() => {
		seconds = ("0" + (Math.floor((timerTime / 1000) % 60) % 60)).slice(-2);
		minutes = ("0" + Math.floor((timerTime / 60000) % 60)).slice(-2);
		hours = ("0" + Math.floor((timerTime / 3600000) % 60)).slice(-2);
	}, [timerTime]);

	const handleClockWindow = () => {
		ipcRenderer.send("open-clock");

		setTimeout(() => {
			ipcRenderer.send("time-send", {
				timerTime,
				fontColor,
				backgroundColor,
				font,
			});
		}, 1000);
	};

	const adjustTimer = (input) => {
		if (input === "incHours" && timerTime + 3600000 < 216000000) {
			setTimerTime(timerTime + 3600000);
		} else if (input === "decHours" && timerTime - 3600000 >= 0) {
			setTimerTime(timerTime - 3600000);
		} else if (input === "incMinutes" && timerTime + 60000 < 216000000) {
			setTimerTime(timerTime + 60000);
		} else if (input === "decMinutes" && timerTime - 60000 >= 0) {
			setTimerTime(timerTime - 60000);
		} else if (input === "incSeconds" && timerTime + 1000 < 216000000) {
			setTimerTime(timerTime + 1000);
		} else if (input === "decSeconds" && timerTime - 1000 >= 0) {
			setTimerTime(timerTime - 1000);
		}
	};

	return (
		<div className="App">
			<div className="controller-grid">
				<div className="grid-time-wrapper">
					<div>Hours : Minutes : Seconds</div>
					<div className="set-clock-buttons">
						<div>
							<button
								name="hour-up"
								onClick={(e) => {
									adjustTimer("incHours");
								}}
							>
								&#8679;
							</button>
						</div>
						<div>
							<button
								name="minutes-up"
								onClick={(e) => {
									adjustTimer("incMinutes");
								}}
							>
								&#8679;
							</button>
						</div>
						<div>
							<button
								name="seconds-up"
								onClick={(e) => adjustTimer("incSeconds")}
							>
								&#8679;
							</button>
						</div>
					</div>
					<div className="countdown-labels">
						{hours} : {minutes} : {seconds}
					</div>

					<div className="set-clock-buttons">
						<div>
							<button
								name="hour-down"
								onClick={(e) => {
									adjustTimer("decHours");
								}}
							>
								&#8681;
							</button>
						</div>
						<div>
							<button
								name="minutes-down"
								onClick={(e) => {
									adjustTimer("deccMinutes");
								}}
							>
								&#8681;
							</button>
						</div>
						<div>
							<button
								name="seconds-down"
								onClick={(e) => adjustTimer("decSeconds")}
							>
								&#8681;
							</button>
						</div>
					</div>
				</div>

				<div className="grid-time-wrapper color-picker">
					<select>
						<option>Select a Font</option>
						<option>Digital</option>
					</select>

					<div>
						<input
							type="text"
							name="font-color"
							placeholder="Enter Font Color"
							value={fontColor}
							onChange={(e) => setFontColor(e.target.value)}
						/>
						<label htmlFor="font-color">Font Color</label>
					</div>

					<div>
						<input
							type="text"
							placeholder="Enter Background Color"
							name="background-color"
							value={backgroundColor}
							onChange={(e) => setBackgroundColor(e.target.value)}
						/>
						<label htmlFor="background-color">Background Color</label>
					</div>
				</div>

				<div
					style={{
						height: "200px",
						textAlign: "center",
					}}
				>
					<Clock
						timerTime={timerTime}
						timerOn={timerOn}
						fontColor={fontColor}
						backgroundColor={backgroundColor}
						windowHeight="100%"
					/>
					<h1>Preview</h1>
				</div>
			</div>

			<div className="controller-clock-buttons">
				{isClockOpen ? (
					<button
						onClick={() =>
							ipcRenderer.send("time-send", {
								timerTime,
								fontColor,
								backgroundColor,
								font,
							})
						}
					>
						Update Timer
					</button>
				) : (
					<button
						disabled={isClockOpen}
						onClick={() => {
							setIsClockOpen(true);
							handleClockWindow();
						}}
					>
						Launch Clock
					</button>
				)}

				<button
					disabled={!isClockOpen}
					onClick={() => {
						ipcRenderer.send("fullscreen-send", !fullscreen);
						setFullscreen(!fullscreen);
					}}
				>
					Toggle Fullscreen Clock
				</button>
			</div>

			<div className="control-button-group">
				<div>
					<button
						className="pause"
						disabled={!timerOn}
						onClick={() => setTimerOn(false)}
					>
						Pause
					</button>
				</div>
				<div>
					<button
						className="start"
						disabled={!isClockOpen || timerOn}
						onClick={() => {
							setTimerOn(true);
							ipcRenderer.send("start-timer-send");
						}}
					>
						Start
					</button>
				</div>
				<div>
					<button
						className="stop"
						disabled={!timerOn}
						onClick={() => setTimerOn(false)}
					>
						Stop
					</button>
				</div>
			</div>
		</div>
	);
}

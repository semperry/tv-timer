// TODO:
// X Y coordinate slider
// Hide particular fields (hh mm ss)
// Button Icons
// Favicon
// Responsive controller style
// Font Loader / installer
// Time Up animations and text
// Stop button should display warning popup before stopping
// Product activation window
// Menu
// Theme
// Warnings
import { useEffect, useState } from "react";

import Clock from "./Clock";

const remote = window.require("@electron/remote");
const { ipcRenderer } = window.require("electron");
const { BrowserWindow, dialog, Menu } = remote;
const shell = window.require("electron").shell;

export default function Home(props) {
	const [timerTime, setTimerTime] = useState(0);
	const [font, setFont] = useState("1");
	const [fontColor, setFontColor] = useState("white");
	const [backgroundColor, setBackgroundColor] = useState("black");
	const [fullscreen, setFullscreen] = useState(false);
	const [isClockOpen, setIsClockOpen] = useState(false);
	const [timerOn, setTimerOn] = useState(false);
	const [infoBox, setInfoBox] = useState(false);
	const [showHours, setShowHours] = useState(true);
	const [showMinutes, setShowMinutes] = useState(true);
	const [showSeconds, setShowSeconds] = useState(true);
	const [x, setX] = useState(window.innerWidth / 2);
	const [y, setY] = useState(window.innerHeight / 2);

	let seconds = ("0" + (Math.floor((timerTime / 1000) % 60) % 60)).slice(-2);
	let minutes = ("0" + Math.floor((timerTime / 60000) % 60)).slice(-2);
	let hours = ("0" + Math.floor((timerTime / 3600000) % 60)).slice(-2);
	let timerInt;

	useEffect(() => {
		ipcRenderer.on("reset-timer-receive", function (e, args) {
			setTimerOn(args);
		});

		// return () => ipcRenderer.removeListener("reset-timer-receive", listener);
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
		ipcRenderer.on("close-clock", function (e, arg) {
			setIsClockOpen(false);
		});

		// return () => ipcRenderer.removeListener("close-clock", listener);
	}, []);

	useEffect(() => {
		if (isClockOpen)
			ipcRenderer.send("time-send", {
				font,
				timerTime,
				fontColor,
				backgroundColor,
				showSeconds,
				showMinutes,
				showHours,
			});
	}, [timerTime]);

	useEffect(() => {
		setTimerOn(props.timerOn);
	}, [props.timerOn]);

	useEffect(() => {
		if (timerOn) {
			timerInt = setInterval(() => {
				const newTime = timerTime - 1000;

				if (newTime >= 0) {
					setTimerTime(newTime);
				} else {
					setTimerOn(false);
					clearInterval(timerInt);
				}
			}, 1000);
		}

		return () => clearInterval(timerInt);
	});

	const handleClockWindow = () => {
		ipcRenderer.send("open-clock");

		setTimeout(() => {
			ipcRenderer.send("time-send", {
				timerTime,
				fontColor,
				backgroundColor,
				font,
				showSeconds,
				showMinutes,
				showHours,
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

		if (isClockOpen)
			ipcRenderer.send("time-send", {
				font,
				timerTime,
				fontColor,
				backgroundColor,
				showSeconds,
				showMinutes,
				showHours,
			});
	};

	return (
		<div className="App">
			<div className="controller-grid">
				<div className="grid-time-wrapper">
					<div>Hours : Minutes : Seconds</div>
					<div className="set-clock-buttons">
						<div>
							<button
								disabled={timerOn}
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
								disabled={timerOn}
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
								disabled={timerOn}
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
								disabled={timerOn}
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
								disabled={timerOn}
								name="minutes-down"
								onClick={(e) => {
									adjustTimer("decMinutes");
								}}
							>
								&#8681;
							</button>
						</div>
						<div>
							<button
								disabled={timerOn}
								name="seconds-down"
								onClick={(e) => adjustTimer("decSeconds")}
							>
								&#8681;
							</button>
						</div>
					</div>
					<div className="checkbox-wrapper">
						<div>
							<input
								name="hh-box"
								type="checkbox"
								defaultChecked={true}
								value={showHours}
								onClick={(e) => {
									ipcRenderer.send("display-options-send", {
										showHours: !showHours,
										showMinutes,
										showSeconds,
									});
									setShowHours(!showHours);
								}}
							/>
							<label htmlFor="hh-box">H</label>
						</div>
						<div>
							<input
								name="mm-box"
								type="checkbox"
								defaultChecked={true}
								value={showMinutes}
								onClick={(e) => {
									ipcRenderer.send("display-options-send", {
										showHours,
										showMinutes: !showMinutes,
										showSeconds,
									});
									setShowMinutes(!showMinutes);
								}}
							/>
							<label htmlFor="mm-box">M</label>
						</div>
						<div>
							<input
								name="ss-box"
								type="checkbox"
								defaultChecked={true}
								value={showSeconds}
								onClick={(e) => {
									ipcRenderer.send("display-options-send", {
										showHours,
										showMinutes,
										showSeconds: !showSeconds,
									});
									setShowSeconds(!showSeconds);
								}}
							/>
							<label htmlFor="ss-box">S</label>
						</div>
					</div>
				</div>
				<div className="grid-time-wrapper color-picker">
					{/* <select>
						<option>Select a Font</option>
						<option>Digital</option>
					</select> */}

					<div>
						<input
							type="number"
							min="1"
							name="font-size"
							disabled={timerOn}
							placeholder="Enter Font Size"
							value={font}
							onChange={(e) => {
								setFont(e.target.value);
								if (isClockOpen)
									ipcRenderer.send("time-send", {
										font: e.target.value,
										timerTime,
										fontColor,
										backgroundColor,
										showSeconds,
										showMinutes,
										showHours,
									});
							}}
						/>
						<label htmlFor="font-size">Font Multiplier (x25px)</label>
					</div>

					<div>
						<input
							type="text"
							name="font-color"
							disabled={timerOn}
							placeholder="Enter Font Color"
							value={fontColor}
							onChange={(e) => {
								setFontColor(e.target.value);
								if (isClockOpen)
									ipcRenderer.send("time-send", {
										font,
										timerTime,
										fontColor: e.target.value,
										backgroundColor,
										showSeconds,
										showMinutes,
										showHours,
									});
							}}
						/>
						<label htmlFor="font-color">Font Color</label>
					</div>

					<div>
						<input
							type="text"
							disabled={timerOn}
							placeholder="Enter Background Color"
							name="background-color"
							value={backgroundColor}
							onChange={(e) => {
								setBackgroundColor(e.target.value);
								if (isClockOpen)
									ipcRenderer.send("time-send", {
										font,
										timerTime,
										fontColor,
										backgroundColor: e.target.value,
										showSeconds,
										showMinutes,
										showHours,
									});
							}}
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
						makeDraggable={false}
						x={x}
						y={y}
						timerTime={timerTime}
						timerOn={timerOn}
						fontColor={fontColor}
						showHours={showHours}
						showMinutes={showMinutes}
						showSeconds={showSeconds}
						font="1.5"
						backgroundColor={backgroundColor}
						windowHeight="100%"
					/>
					<h1>
						Preview{" "}
						<span
							style={{
								fontWeight: "normal",
								fontSize: "20px",
								cursor: "pointer",
							}}
							onMouseEnter={(e) => {
								setInfoBox(true);
							}}
							onMouseLeave={(e) => setInfoBox(false)}
						>
							[?]
						</span>
						<span
							style={{
								display: `${infoBox ? "block" : "none"}`,
								backgroundColor: "lightyellow",
								position: "relative",
								top: "15px",
								right: "25px",
								border: "1px solid transparent",
								borderRadius: "5px",
								fontWeight: "500",
								fontSize: ".5em",
							}}
						>
							*Preview may not reflect actual countdown. Refer to full size
							clock for true count.
							<br />
							*When exluding a time field (ex: display only mm : ss), values
							that are selected will still be reflected in the countdown. They
							are just hidden from view.
						</span>
					</h1>
				</div>
			</div>

			<div className="controller-clock-buttons">
				{isClockOpen ? (
					<button
						disabled={timerOn}
						style={{
							backgroundColor: "firebrick",
							border: "1px solid transparent",
						}}
						onClick={() => ipcRenderer.send("close-clock")}
					>
						Close Clock
					</button>
				) : (
					<button
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

			<div className="coordinate-sliders">
				<div>
					<input
						name="x-slider"
						type="range"
						min="-1000"
						value={x}
						max="3000"
						onChange={(e) => {
							setX(e.target.value);
							ipcRenderer.send("coordinates-send", { x: e.target.value, y });
						}}
					/>
					<label htmlFor="x-slider">X Axis Adjust</label>
				</div>

				<div>
					<input
						name="y-slider"
						type="range"
						min="-1000"
						value={y}
						max="3000"
						onChange={(e) => {
							setY(e.target.value);
							ipcRenderer.send("coordinates-send", { y: e.target.value, x });
						}}
					/>
					<label htmlFor="y-slider">Y Axis Adjust</label>
				</div>
				<div>
					<button
						onClick={() => {
							setX(window.innerHeight / 2);
							setY(window.innerWidth / 2);
							ipcRenderer.send("coordinates-send", {
								y: "",
								x: "",
							});
						}}
					>
						Reset
					</button>
				</div>
			</div>

			<div className="control-button-group">
				<div>
					<button
						className="pause"
						disabled={!timerOn}
						onClick={() => {
							setTimerOn(false);
							setTimerTime(timerTime);
							ipcRenderer.send("start-timer-send", false);
						}}
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
							ipcRenderer.send("start-timer-send", {
								startTimer: true,
								timerTime,
								showSeconds,
								showMinutes,
								showHours,
							});
						}}
					>
						Start
					</button>
				</div>
				<div>
					<button
						className="stop"
						disabled={timerTime <= 0}
						onClick={() => {
							setTimerTime(0);
							setTimerOn(false);
							ipcRenderer.send("start-timer-send", {
								startTimer: false,
								timerTime: 0,
							});
							ipcRenderer.send("time-send", {
								timerTime: 0,
								fontColor,
								backgroundColor,
								font,
								showSeconds,
								showMinutes,
								showHours,
							});
						}}
					>
						{timerTime > 0 && !timerOn ? "Reset" : "Stop"}
					</button>
				</div>
			</div>
		</div>
	);
}

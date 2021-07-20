import { useEffect, useState } from "react";

import Clock from "./Clock";

const remote = window.require("@electron/remote");
const { ipcRenderer } = window.require("electron");
const { BrowserWindow, dialog, Menu } = remote;
const shell = window.require("electron").shell;

export default function Home(props) {
	const [hour, setHour] = useState("00");
	const [seconds, setSeconds] = useState("00");
	const [minutes, setMinutes] = useState("00");
	const [font, setFont] = useState("digital");
	const [fontColor, setFontColor] = useState("white");
	const [backgroundColor, setBackgroundColor] = useState("black");
	const [fullscreen, setFullscreen] = useState(false);
	const [isClockOpen, setIsClockOpen] = useState(false);
	const [currentStatus, setCurrentStatus] = useState("stop");

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

	const handleClockWindow = () => {
		ipcRenderer.send("open-clock");

		setTimeout(() => {
			ipcRenderer.send("time-send", {
				hour,
				seconds,
				minutes,
				fontColor,
				backgroundColor,
				font,
			});
		}, 1000);
	};

	const valueToSet = (target, lengthToCheck) => {
		if (target == "10") {
			return "10";
		} else if (lengthToCheck.length === 2 && lengthToCheck[0] === "0") {
			return "0" + target;
		} else {
			return target;
		}
	};

	return (
		<div className="App">
			<div className="controller-grid">
				<div className="grid-time-wrapper">
					<div>
						<input
							type="number"
							min="0"
							name="hour"
							value={hour}
							onChange={(e) => {
								setHour(valueToSet(e.target.value, hour));
							}}
						/>
						<label htmlFor="hour">Hours</label>
					</div>
					<div>
						<input
							type="number"
							min="0"
							max="60"
							value={minutes}
							name="minutes"
							onChange={(e) => {
								setMinutes(valueToSet(e.target.value, minutes));
							}}
						/>
						<label htmlFor="minutes">Minutes</label>
					</div>
					<div>
						<input
							type="number"
							min="0"
							max="60"
							value={seconds}
							name="seconds"
							onChange={(e) => setSeconds(valueToSet(e.target.value, seconds))}
						/>
						<label htmlFor="seconds">Seconds</label>
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
						hour={hour}
						seconds={seconds}
						minutes={minutes}
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
								hour,
								seconds,
								minutes,
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
						disabled={currentStatus === "pause" || currentStatus === "stop"}
						onClick={() => setCurrentStatus("pause")}
					>
						Pause
					</button>
				</div>
				<div>
					<button
						className="start"
						disabled={currentStatus === "start"}
						onClick={() => setCurrentStatus("start")}
					>
						Start
					</button>
				</div>
				<div>
					<button
						className="stop"
						disabled={currentStatus === "stop"}
						onClick={() => setCurrentStatus("stop")}
					>
						Stop
					</button>
				</div>
			</div>
		</div>
	);
}

import { useState, useEffect } from "react";

const remote = window.require("@electron/remote");
const { ipcRenderer } = window.require("electron");
const { BrowserWindow, dialog, Menu } = remote;

export default function Clock(props) {
	const [timerTime, setTimerTime] = useState(props.timerTime || 0);
	const [timerOn, setTimerOn] = useState(props.timerOn || false);
	const [timerStart, setTimerStart] = useState(0);
	const [font, setFont] = useState(props.font || "digital-7");
	const [fontColor, setFontColor] = useState(props.fontColor || "white");
	const [backgroundColor, setBackgroundColor] = useState(
		props.backgroundColor || "black"
	);
	let seconds = ("0" + (Math.floor((timerTime / 1000) % 60) % 60)).slice(-2);
	let minutes = ("0" + Math.floor((timerTime / 60000) % 60)).slice(-2);
	let hours = ("0" + Math.floor((timerTime / 3600000) % 60)).slice(-2);
	let timerInt;

	useEffect(() => {
		let listener = ipcRenderer.on("time-receive", (e, arg) => {
			setTimerTime(arg.timerTime);
			setFont(arg.font);
			setFontColor(arg.fontColor);
			setBackgroundColor(arg.backgroundColor);
		});

		return () => ipcRenderer.removeListener("time-receive", listener);
	}, []);

	useEffect(() => {
		if (props) {
			setTimerTime(props.timerTime || 0);
			setFont(props.font || "digital");
			setFontColor(props.fontColor || "white");
			setBackgroundColor(props.backgroundColor || "black");
		}
	}, [props]);

	useEffect(() => {
		let listener = ipcRenderer.on("start-timer-receive", (e, args) => {
			setTimerOn(true);
		});

		return () => {
			ipcRenderer.removeListener("start-timer-receive", listener);
		};
	}, []);

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
					ipcRenderer.send("reset-timer-send", false);
				}
			}, 1000);
		}

		return () => clearInterval(timerInt);
	});

	return (
		<div
			style={{
				color: fontColor,
				backgroundColor,
				height: `${props.windowHeight || "100vh"}`,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
			}}
		>
			<p
				className="clock-text"
				style={{
					fontSize: "50px",
					fontFamily: font,
				}}
			>
				{hours} : {minutes} : {seconds}
			</p>
		</div>
	);
}

import { useState, useEffect } from "react";
import Draggable from "../components/Draggable";

const remote = window.require("@electron/remote");
const { ipcRenderer } = window.require("electron");
const { BrowserWindow, dialog, Menu } = remote;

let timerInt;

export default function Clock(props) {
	const [timerTime, setTimerTime] = useState(props.timerTime || 0);
	const [timerOn, setTimerOn] = useState(props.timerOn || false);
	const [font, setFont] = useState(props.font || "1");
	const [fontColor, setFontColor] = useState(props.fontColor || "white");
	const [backgroundColor, setBackgroundColor] = useState(
		props.backgroundColor || "black"
	);
	const [showHours, setShowHours] = useState(props.showHours);
	const [showMinutes, setShowMinutes] = useState(props.showMinutes);
	const [showSeconds, setShowSeconds] = useState(props.showSeconds);
	const [translate, setTranslate] = useState({
		x: 0,
		y: 0,
	});

	let seconds = ("0" + (Math.floor((timerTime / 1000) % 60) % 60)).slice(-2);
	let minutes = ("0" + Math.floor((timerTime / 60000) % 60)).slice(-2);
	let hours = ("0" + Math.floor((timerTime / 3600000) % 60)).slice(-2);

	useEffect(() => {
		ipcRenderer.on("time-receive", (e, arg) => {
			setTimerTime(arg.timerTime || timerTime);
			setFont(arg.font || font);
			setFontColor(arg.fontColor || fontColor);
			setBackgroundColor(arg.backgroundColor || backgroundColor);
			setShowSeconds(arg.showSeconds);
			setShowMinutes(arg.showMinutes);
			setShowHours(arg.showHours);
		});

		// return () => ipcRenderer.removeListener("time-receive", listener);
	}, []);

	useEffect(() => {
		if (props) {
			setTimerTime(props.timerTime || 0);
			setFont(props.font || "1");
			setFontColor(props.fontColor || "white");
			setBackgroundColor(props.backgroundColor || "black");
			setShowSeconds(props.showSeconds);
			setShowMinutes(props.showMinutes);
			setShowHours(props.showHours);
			setTimerTime(props.timerTime);
		}
	}, [props]);

	useEffect(() => {
		ipcRenderer.on("coordinates-receive", (e, args) => {
			setTranslate({
				x: args.x,
				y: args.y,
			});
		});
	}, []);

	useEffect(() => {
		ipcRenderer.on("start-timer-receive", (e, args) => {
			setTimerOn(args.startTimer);
			setTimerTime(args.timerTime);
			setShowSeconds(args.showSeconds);
			setShowMinutes(args.showMinutes);
			setShowHours(args.showHours);
		});

		// return () => {
		// 	ipcRenderer.removeListener("start-timer-receive", listener);
		// };
	}, []);

	useEffect(() => {
		setTimerOn(props.timerOn);
	}, [props.timerOn]);

	useEffect(() => {
		ipcRenderer.on("display-options-receive", (e, args) => {
			setShowSeconds(args.showSeconds);
			setShowMinutes(args.showMinutes);
			setShowHours(args.showHours);
		});
	}, []);

	useEffect(() => {
		if (timerOn) {
			timerInt = setInterval(() => {
				const newTime = timerTime - 1000;

				if (newTime >= 0) {
					setTimerTime(newTime);
					setShowSeconds(showSeconds);
					setShowMinutes(showMinutes);
					setShowHours(showHours);
				} else {
					setTimerOn(false);
					clearInterval(timerInt);
					ipcRenderer.send("reset-timer-send", false);
				}
			}, 1000);
		}

		return () => clearInterval(timerInt);
	});

	const handleDragMove = (e) => {
		setTranslate({
			x: translate.x + e.movementX,
			y: translate.y + e.movementY,
		});
	};

	const formatTimeDisplay = () => {
		if (showHours && showMinutes && showSeconds)
			return `${hours} : ${minutes} : ${seconds}`;
		if (!showHours && !showMinutes && showSeconds) return `${seconds}`;
		if (!showHours && showMinutes && showSeconds)
			return `${minutes} : ${seconds}`;
		if (!showHours && showMinutes && !showSeconds) return `${minutes}`;
		if (showHours && !showMinutes && showSeconds)
			return `${hours} : ${seconds}`;
		if (showHours && showMinutes && !showSeconds)
			return `${hours} : ${minutes}`;
		if (showHours && !showMinutes && !showSeconds) return `${hours}`;
		if (!showHours && !showMinutes && !showSeconds) return "Please Check a Box";
	};

	return (
		<div
			className="clock-wrapper"
			style={{
				color: fontColor,
				backgroundColor,
				height: `${props.windowHeight || "100vh"}`,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				overflow: "hidden",
			}}
		>
			{props.makeDraggable ? (
				<Draggable
					onDragMove={handleDragMove}
					style={{
						transform: `translateX(${translate.x}px) translateY(${translate.y}px)`,
					}}
				>
					<p
						className="clock-text"
						style={{
							fontSize: `${25 * font}px`,
							userSelect: "none",
						}}
					>
						{formatTimeDisplay()}
					</p>
				</Draggable>
			) : (
				<p
					className="clock-text"
					style={{
						fontSize: `${25 * font}px`,
						userSelect: "none",
					}}
				>
					{formatTimeDisplay()}
				</p>
			)}
		</div>
	);
}

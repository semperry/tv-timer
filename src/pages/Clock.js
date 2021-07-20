import { useState, useEffect } from "react";

const remote = window.require("@electron/remote");
const { ipcRenderer } = window.require("electron");
const { BrowserWindow, dialog, Menu } = remote;

export default function Clock(props) {
	const [hour, setHour] = useState(props.hour || "00");
	const [seconds, setSeconds] = useState(props.seconds || "00");
	const [minutes, setMinutes] = useState(props.minutes || "00");
	const [font, setFont] = useState(props.font || "digital-7");
	const [fontColor, setFontColor] = useState(props.fontColor || "white");
	const [backgroundColor, setBackgroundColor] = useState(
		props.backgroundColor || "black"
	);

	useEffect(() => {
		let listener = ipcRenderer.on("time-receive", (e, arg) => {
			setHour(arg.hour);
			setSeconds(arg.seconds);
			setMinutes(arg.minutes);
			setFont(arg.font);
			setFontColor(arg.fontColor);
			setBackgroundColor(arg.backgroundColor);
		});

		return () => ipcRenderer.removeListener("time-receive", listener);
	}, []);

	useEffect(() => {
		if (props) {
			setHour(props.hour || 0);
			setSeconds(props.seconds || 0);
			setMinutes(props.minutes || 0);
			setFont(props.font || "digital");
			setFontColor(props.fontColor || "white");
			setBackgroundColor(props.backgroundColor || "black");
		}
	}, [props]);

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
				{hour} : {minutes} : {seconds}
			</p>
		</div>
	);
}

//1. Install dependencies - tensorflow.js, handpose model, react-webcam DONE
//2. Import dependencies DONE
//3. Setup webcam and canvas - DONE
//4.Define references to those - DONE
//5.Load Handpose - DONE
//6.Detect function - DONE
//7. Drawing utilities from tensorflow - DONE
//8. Draw functions - DONE

/*
steps for handpose recognition:
1.install fingerpose : npm install fingerpose DONE
2.Add use state DONE
3.Import emojis and finger pose import * as fp from "fingerpose"; DONE
4. Update detect function for gesture handling
5.Setup hook and emoji object //for handling state of the app.
6.Add emoji display to the screen

 */
import React, {useRef, useState} from 'react';
import * as tf from "@tensorflow/tfjs";
import * as handpose from "@tensorflow-models/handpose"; //for detecting hands
import Webcam from "react-webcam";
import './App.css';
import {drawHand} from "./utilities";

import * as fp from "fingerpose"; //trained neural network for gesture predictions
import victory from "./victory.png";
import thumbs_up from "./thumbs_up.png";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [emoji, setEmoji] = useState(null);
  const images = {thumbs_up: thumbs_up, victory:victory };
  
  const runHandpose = async () =>{
    const net = await handpose.load(); //net variable will hold the model
    //console.log('Handpose model loaded');
    // Loop and detect hands
    
    setInterval(()=>{
      detect(net)
    }, 100) //detect in every 100 mili seconds
  };
  //pass the neural network model 'net' in the detect()
  const detect = async (net) =>{
    //check data is available
    if(
      typeof webcamRef.current != "undefined" &&
      webcamRef.current != null &&
      webcamRef.current.video.readyState === 4
      ){
        //get video properties(height and widht)
        const video = webcamRef.current.video;
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        
        //set canvas height and width
        canvasRef.current.width = videoWidth;
        canvasRef.current.height = videoHeight;

        //make detections
        const hand = await net.estimateHands(video);
        console.log(hand);

        //gesture detection
        if(hand.length>0){
          const GE = new fp.GestureEstimator([
            fp.Gestures.VictoryGesture,
            fp.Gestures.ThumbsUpGesture,
            //we can add more gestures here
          ])

          const gesture = await GE.estimate(hand[0].landmarks, 8);
          //console.log(gesture);
          if(gesture.gestures != undefined && gesture.gestures.length >0){
            //grabbing the confidence of each gesture
            const confidence = gesture.gestures.map(
              (prediction) => prediction.confidence
            );
            //grabbing the maxConfidence gesture
            const maxConfidence = confidence.indexOf(
              Math.max.apply(null, confidence)
            );
            setEmoji(gesture.gestures[maxConfidence].name);
            console.log(emoji);
          }
        }
        
        //draw mesh
        const ctx = canvasRef.current.getContext("2d");
        drawHand(hand,ctx);

      }
  };

  runHandpose();

  return (
    <div className="App">
      <header className="App-header">

      <Webcam ref = {webcamRef}
         style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }} />

      <canvas ref = {canvasRef}
         style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }} />

        

      </header>
    </div>
  );
}

export default App;

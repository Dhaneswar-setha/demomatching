import React, { useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Button,
  InputLabel,
  FormControl,
  Select,
  Box,
  Grid,
  Card,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  
} from "@mui/material";
// import Modal from "@mui/material/Modal";
const nodeRadius = 15; // Increased size of the dot
const columnGap = 10; // Added space between columns

const defaultPairs = [
  {
    id: 1,
    left: "Apple",
    right:
      "https://www.shutterstock.com/image-photo/red-apple-isolated-on-white-600nw-1727544364.jpg",
  },
  {
    id: 2,
    left: "Banana",
    right:
      "https://w7.pngwing.com/pngs/186/294/png-transparent-banana-a-banana-food-banana-leaves-cartoon-thumbnail.png",
  },
  {
    id: 3,
    left: "Grapes",
    right:
      "https://i.pinimg.com/originals/7a/38/e7/7a38e7207389f22a6a27f4e095807792.png",
  },
  {
    id: 4,
    left: "Orange",
    right: "https://pngfre.com/wp-content/uploads/orange-poster.png",
  },
];

let answerArray = [];

const findClosestNode = (nodes, point, threshold = nodeRadius) =>
  nodes.find(
    (node) =>
      Math.abs(point.x - node.x) < threshold &&
      Math.abs(point.y - node.y) < threshold,
  );

const sameHorizontal = (p1, p2) => p1 && p2 && p1.y === p2.y;
const sameVertical = (p1, p2) => p1 && p2 && p1.x === p2.x;

const equalsNode = (n1, n2) => n1 && n2 && n1.x === n2.x && n1.y === n2.y;
const equalsEdge = (e1, e2) =>
  equalsNode(e1[0], e2[0]) && equalsNode(e1[1], e2[1]);

const hasEdge = (edges, edge) =>
  edges.some((otherEdge) => equalsEdge(edge, otherEdge));

const addEdge = (edges, edge) => {
  // Check if the left node of the new edge is already connected
  const leftNodeConnected = edges.some(([start]) => equalsNode(start, edge[0]));

  // Check if the right node of the new edge is already connected
  const rightNodeConnected = edges.some(([, end]) => equalsNode(end, edge[1]));

  // If either the left or right node is already connected, don't add the new edge
  if (leftNodeConnected || rightNodeConnected) {
    return false;
  }

  // If neither left nor right node is already connected, add the new edge
  edges.push(edge);
  return true;
};

const renderCanvas = (canvas, leftArr, rightArr) => {
  const ctx = canvas.getContext("2d");
  ctx.canvas.width = 125;
  ctx.canvas.height = 235;
  console.log(leftArr, rightArr);

  const { height, width } = ctx.canvas;
  const rowHeight = height / leftArr.length;
  const margin = nodeRadius * 7.0;

  const nodes = [
    ...leftArr.map((_, i) => ({
      id: _.id,
      x: margin,
      y: i * rowHeight + rowHeight / 2,
    })),
    ...rightArr.map((_, i) => ({
      id: _.id,
      x: width - margin,
      y: i * rowHeight + rowHeight / 2,
    })),
  ];
  const edges = [];

  let activeNode = null;
  let pointer = null;
  let isDragging = false;

  const getPointerPosition = (e) => {
    const rect = e.target.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onTouchStart = (e) => {
    const touch = e.touches[0];
    pointer = getPointerPosition(touch);
    const closestNode = findClosestNode(nodes, pointer);
    activeNode = closestNode;
    isDragging = true;
  };

  const onTouchMove = (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    pointer = getPointerPosition(touch);
  };

  const onTouchEnd = (e) => {
    e.preventDefault();
    isDragging = false;

    const intentRadius = nodeRadius * 1.5;
    const closestNode = findClosestNode(nodes, pointer, intentRadius);
    if (
      activeNode &&
      closestNode &&
      !equalsNode(activeNode, closestNode) &&
      !sameVertical(activeNode, closestNode)
    ) {
      const edge = [activeNode, closestNode].sort((a, b) => a.x - b.x);
      addEdge(edges, edge);
      activeNode = null;

      //------------------- My code -------------------
      answerArray.push(edge);
      // ----------------------------------------------
    }
  };

  const animate = () => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    edges.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });

    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
      ctx.fillStyle = equalsNode(node, activeNode) ? "black" : "darkgrey";
      ctx.fill();
    });

    if (isDragging && activeNode) {
      const intentRadius = nodeRadius * 1.5;
      const closestNode = findClosestNode(nodes, pointer, intentRadius);
      const intent = closestNode || pointer;

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";
      ctx.setLineDash([3, 3]);
      ctx.moveTo(activeNode.x, activeNode.y);
      ctx.lineTo(intent.x, intent.y);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    requestAnimationFrame(animate);
  };

  animate();

  return { onTouchStart, onTouchMove, onTouchEnd };
};

const randomize = () => Math.random() - 0.5;

const Matching = () => {
  const canvasRef = useRef();
  const [pairs, setPairs] = useState(defaultPairs);
  const [submissionCorrect, setSubmissionCorrect] = useState(false);

  const leftArr = useMemo(
    () =>
      pairs
        .map((pair) => ({
          id: pair.id,
          left: pair.left,
        }))
        .sort(randomize),
    [pairs],
  );

  const rightArr = useMemo(
    () =>
      pairs
        .map((pair) => ({
          id: pair.id,
          right: pair.right,
        }))
        .sort(randomize),
    [pairs],
  );

  useEffect(() => {
    const { onTouchStart, onTouchMove, onTouchEnd } = renderCanvas(
      canvasRef.current,
      leftArr,
      rightArr,
    );

    // Add listeners
    canvasRef.current.addEventListener("touchstart", onTouchStart);
    canvasRef.current.addEventListener("touchmove", onTouchMove);
    canvasRef.current.addEventListener("touchend", onTouchEnd);

    // Cleanup listeners
    return () => {
      canvasRef.current.removeEventListener("touchstart", onTouchStart);
      canvasRef.current.removeEventListener("touchmove", onTouchMove);
      canvasRef.current.removeEventListener("touchend", onTouchEnd);
    };
  }, [canvasRef, leftArr, rightArr]);

  const handleReset = () => {
    // Clear canvas
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Reset pairs state
    setPairs(defaultPairs);
    setSubmissionCorrect(false); // Reset submission correctness
    window.location.reload();
  };

  const handleSubmit = () => {
    // Check if the left and right column IDs match for all pairs
    console.log("answerArray", answerArray);
    if (answerArray.length < defaultPairs.length) alert("Answer all questions");
    else {
      let correctAnswerCount = 0;
      let wrongAnswerCount = 0;
      answerArray.forEach((ans, i) => {
        if (ans[0].id == ans[1].id) correctAnswerCount += 1;
        else wrongAnswerCount += 1;
      });
      alert(
        "Coorect: " + correctAnswerCount + "    Wrong: " + wrongAnswerCount,
      );

      // submit answerArray
    }
    const correct = pairs.every((pair) => pair.id === pair.right.id);

    // Set submission correctness
    setSubmissionCorrect(correct);
  };

  return (
    <div className="App">
      <Modal open={modals} onClose={() => setModals(false)}>
        <Box sx={style}>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <h1>Correct Answer: {correctans}</h1>
          </div>
          <Button
            variant="contained"
            sx={{
              width: 70,
              marginTop: 2,
              marginBottom: 1,
              marginRight: 1,
            }}
            onClick={() => setModals(false)}
          >
            OK
          </Button>
        </Box>
      </Modal>
      <div className="Col" style={{ height: "250px" }}>
        {leftArr.map((e) => (
          <div key={e.left}>{e.left}</div>
        ))}
      </div>
      <div className="LinesContainer">
        <canvas ref={canvasRef} className="Lines"></canvas>
      </div>
      <div className="Col" style={{ height: "250px" }}>
        {rightArr.map((url, index) => (
          <div key={index}>
            <img
              src={url.right}
              alt={`fruit-${index}`}
              style={{ width: "60px", height: "auto" }}
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleReset}
        className="ResetButton"
        style={{
          backgroundColor: "white",
          colour: "black",
          borderRadius: "10px",
          border: "1px solid black",
        }}
      >
        Reset
      </button>
      <button
        onClick={handleSubmit}
        className="SubmitButton"
        style={{ backgroundColor: "#0060ca", borderRadius: "10px" }}
      >
        Submit
      </button>
      {/* <h1>{userId}</h1> */}
    </div>
  );
};

export default Matching;

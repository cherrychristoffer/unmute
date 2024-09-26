import React from "react";

const ProgressBar = ({ progress }) => {
  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.filler,
          width: `${progress}%`,
        }}
      />
      <span style={styles.label}>{progress}%</span>
    </div>
  );
};

const styles = {
  container: {
    height: "30px",
    width: "100%",
    backgroundColor: "#e0e0df",
    borderRadius: "5px",
    overflow: "hidden",
    position: "relative",
  },
  filler: {
    height: "100%",
    backgroundColor: "#3b5998",
    transition: "width 0.5s ease-in-out",
  },
  label: {
    position: "absolute",
    top: "5px",
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    fontWeight: "bold",
  },
};

export default ProgressBar;

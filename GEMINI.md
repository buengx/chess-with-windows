# Project Overview

This is a chess game where the chessboard and the pieces are represented by browser windows. The main window creates and manages the board, which is an 8x8 grid of 64 individual popup windows. Each popup window represents a square on the chessboard.

**Technologies:**
* HTML
* CSS
* JavaScript

# Running the project

To run the project, simply open the `index.html` file in your web browser and click the "Create Chessboard" button. You may need to allow multiple popups in your browser settings.

# Project Implementation

The chessboard is created in `script.js`. When the "Create Chessboard" button is clicked, the following happens:

1.  An 8x8 grid of popup windows is created using nested loops.
2.  Each window is given a name corresponding to its algebraic chess notation (e.g., "a1", "h8").
3.  The size and position of each window are calculated to form a chessboard pattern.
4.  The background color of each window is set to either white or black to create the checkerboard pattern.

# Development Conventions

There are no specific development conventions at this time. As the project grows, we can establish guidelines for code style, testing, and contributions.

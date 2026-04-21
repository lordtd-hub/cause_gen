---
course_id: calculus1_real_check
source_title: Calculus 1 Applied Problem Set
source_type: latex-problem-set
source_file: user-provided-inline-latex
intake_status: example-fixture
math_format: latex
needs_human_review: true
---

# LaTeX Problem Set Intake

## Source Metadata

- Source title: Calculus 1: Applied Problem Set
- Source file: provided inline by user during Engine 3 building-block design
- Intended course: `calculus1_real_check`
- Use mode: `manual-review-first`

## Part To Module Map

| Part | Section Label | Suggested Module | Suggested CLO | Suggested Bloom | Notes |
| --- | --- | --- | --- | --- | --- |
| Applied 1 | Motion and rates | differentiation | CLO2 | apply | strong derivative and velocity focus |
| Applied 2 | Optimization | differentiation | CLO3 | analyze | many max/min contexts |
| Applied 3 | Related rates | differentiation | CLO3 | analyze | visual context may be needed for some items |
| Applied 4 | Exponential models | integration | CLO4 | evaluate | interpretation-heavy modeling items |
| Applied 5 | Accumulation and applied integrals | integration | CLO4 | evaluate | later review may split some rows across modules |

## Review Notes

- This fixture exists to pressure-test the shared `LaTeX Problem Set Intake` block with applied and modeling-heavy items.
- All mathematics should remain in LaTeX form when rows are later moved into `problem-pool-starter.md` or `problem-pool.json`.
- Some items contain multi-part prompts and should probably become more than one normalized problem-pool row.
- Some related-rates or geometry items may need an extra `visual_context_required` flag during later normalization.

## Raw Problem Blocks

```tex
\documentclass[12pt]{article}
\usepackage{amsmath, amssymb}
\usepackage[a4paper, margin=1in]{geometry}

\title{Calculus 1: Applied Problem Set}
\author{}
\date{}

\begin{document}
\maketitle

\section*{Applied Problems}

\begin{enumerate}

\item A ball is thrown upward from the ground with height
\[
s(t)=20t-4.9t^2
\]
where $s$ is measured in meters and $t$ in seconds.
Find:
\begin{enumerate}
    \item the velocity at time $t$,
    \item the velocity after $2$ seconds,
    \item the maximum height reached by the ball.
\end{enumerate}

\item The position of a particle moving along a line is given by
\[
s(t)=t^3-6t^2+9t+1.
\]
Find all times when the particle is at rest.

\item The cost of producing $x$ units of a product is
\[
C(x)=500+12x+0.02x^2.
\]
Find the marginal cost and estimate the cost of producing the $101$st unit.

\item The revenue from selling $x$ units is
\[
R(x)=30x-0.05x^2.
\]
Find the marginal revenue and determine the value of $x$ for which revenue is maximized.

\item The profit function of a company is
\[
P(x)= -0.01x^2+8x-200.
\]
Find the production level that maximizes profit.

\item A square sheet of metal of side length $20$ cm is used to form an open box by cutting equal squares of side length $x$ cm from each corner and folding up the sides.
\begin{enumerate}
    \item Write the volume function.
    \item Find the value of $x$ that maximizes the volume.
\end{enumerate}

\item A farmer wants to fence a rectangular field using $200$ meters of fencing.
Find the dimensions that maximize the area.

\item A rectangle is inscribed under the parabola
\[
y=12-x^2
\]
and above the $x$-axis.
Find the dimensions of the rectangle with maximum area.

\item A company estimates that the demand function for its product is
\[
p(x)=100-2x,
\]
where $p$ is the price per unit when $x$ units are sold.
Find the number of units that should be sold to maximize revenue.

\item Water is poured into a conical tank of radius $3$ m and height $6$ m at a rate of $2$ m$^3$/min.
How fast is the water level rising when the depth of the water is $4$ m?

\item Air is being pumped into a spherical balloon so that its volume increases at a rate of $100$ cm$^3$/s.
How fast is the radius increasing when the radius is $5$ cm?

\item A ladder $10$ m long leans against a vertical wall. The bottom of the ladder slides away from the wall at a rate of $1$ m/s.
How fast is the top of the ladder sliding down when the bottom is $6$ m from the wall?

\item A car travels along a straight road so that its position at time $t$ is
\[
s(t)=t^3-3t^2+2t.
\]
Find the intervals where the car is moving forward and the intervals where it is moving backward.

\item The temperature $T$ of a cup of coffee $t$ minutes after it is poured is modeled by
\[
T(t)=25+60e^{-0.1t}.
\]
Find:
\begin{enumerate}
    \item the initial temperature,
    \item the rate of change of temperature,
    \item the rate of cooling after $5$ minutes.
\end{enumerate}

\item A population of bacteria is modeled by
\[
P(t)=1000e^{0.03t}.
\]
Find the growth rate and the population after $10$ time units.

\item A radioactive substance decays according to
\[
A(t)=500e^{-0.08t}.
\]
Find the rate at which the substance is changing after $6$ time units.

\item The amount of pollutant in a lake after $t$ years is given by
\[
Q(t)=100+20t-0.5t^2.
\]
Find when the pollutant amount is increasing and when it is decreasing.

\item A manufacturer finds that the total cost in dollars of producing $x$ units is
\[
C(x)=1000+15x+0.01x^2,
\]
while the total revenue is
\[
R(x)=40x-0.02x^2.
\]
Find the production level that maximizes profit.

\item A window is designed so that it consists of a rectangle topped by a semicircle. If the perimeter of the window is fixed at $10$ meters, find the dimensions that maximize the area.

\item A cylindrical can is to be made to hold $500$ cm$^3$ of liquid.
Find the radius and height that minimize the surface area.

\item The height of a projectile is given by
\[
h(t)=80t-16t^2.
\]
Find:
\begin{enumerate}
    \item the maximum height,
    \item the time when it hits the ground,
    \item the instantaneous velocity at $t=1$.
\end{enumerate}

\item The distance traveled by a particle is
\[
s(t)=4t^2+2t.
\]
Find the average velocity on the interval $[1,3]$ and the instantaneous velocity at $t=2$.

\item The amount of water in a tank at time $t$ is
\[
V(t)=50+10t-0.4t^2.
\]
Find when the tank contains the maximum amount of water.

\item The concentration of a medicine in the bloodstream is modeled by
\[
C(t)=5te^{-0.5t}.
\]
Find the time at which the concentration is greatest.

\item A rectangular pen is to be built along a river, so no fence is needed on the side along the river. If $100$ meters of fencing is available, find the dimensions that maximize the enclosed area.

\item A company determines that the number of units sold per week when the price is $p$ dollars is
\[
x=500-20p.
\]
Express the revenue as a function of $p$, and find the price that maximizes revenue.

\item A beam of light is located at the point $(2,3)$.
Find the equation of the tangent line to the curve
\[
y=x^2+1
\]
at the point where $x=2$, and interpret its slope.

\item The displacement of an object is
\[
s(t)=\sin t + \cos t.
\]
Find the velocity and acceleration functions.

\item A student throws a stone into a pond, producing a circular ripple whose radius increases at a rate of $3$ cm/s.
How fast is the area of the ripple increasing when the radius is $10$ cm?

\item The side of a square is increasing at a rate of $2$ cm/s.
How fast is the area increasing when the side length is $5$ cm?

\item The radius of a circle decreases at a rate of $0.4$ cm/s.
How fast is the circumference changing when the radius is $8$ cm?

\item The radius of a sphere is increasing at a rate of $0.5$ m/s.
How fast is the volume changing when the radius is $4$ m?

\item The edge length of a cube changes with time. When the edge length is $x$ cm, its volume is $V=x^3$.
Find the rate of change of volume with respect to time in terms of $\frac{dx}{dt}$.

\item A company's cost function is
\[
C(x)=2000+25x,
\]
and the revenue function is
\[
R(x)=50x-0.1x^2.
\]
Find all break-even points.

\item The function
\[
f(x)=x^3-12x+5
\]
models the net benefit of a system.
Find the local maximum and local minimum values.

\item A box with a square base and no lid must have volume $108$ cm$^3$.
Find the dimensions that minimize the amount of material used.

\item A train moves so that its position is
\[
s(t)=t^4-8t^3+18t^2.
\]
Find the acceleration at time $t$ and determine when the train changes direction.

\item A particle moves according to
\[
s(t)=\frac{1}{t+1}.
\]
Find the velocity and determine whether the particle is speeding up or slowing down at $t=1$.

\item The marginal cost of producing $x$ items is
\[
C'(x)=10+0.04x.
\]
If the fixed cost is \$300, find the cost function $C(x)$.

\item The marginal revenue is
\[
R'(x)=100-0.2x.
\]
If the revenue from selling no items is zero, find the revenue function.

\item The rate at which water flows into a tank is
\[
r(t)=5+2t
\]
liters per minute.
Find the total amount of water added during the first $4$ minutes.

\item The velocity of a moving object is
\[
v(t)=3t^2-6t+2.
\]
If the position at time $t=0$ is $s(0)=5$, find the position function.

\item The force acting on an object is
\[
F(x)=2x+3.
\]
Find the work done in moving the object from $x=1$ to $x=4$.

\item The rate of learning of a student is modeled by
\[
L'(t)=4e^{-0.2t}.
\]
If $L(0)=10$, find $L(t)$.

\item A company's marginal profit is
\[
P'(x)=50-0.5x.
\]
Find the change in profit when production increases from $20$ units to $60$ units.

\item The speed of a particle is
\[
v(t)=t^2-4t+3.
\]
Find the total distance traveled on the interval $[0,4]$.

\end{enumerate}

\end{document}
```

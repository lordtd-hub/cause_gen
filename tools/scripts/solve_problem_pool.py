#!/usr/bin/env python
import argparse
import datetime
import json
import pathlib
import re
import sys
from typing import Any

ROOT = pathlib.Path(__file__).resolve().parents[2]
VENDOR_DIR = ROOT / "tools" / "vendor_clean"
if str(VENDOR_DIR) not in sys.path:
    sys.path.insert(0, str(VENDOR_DIR))

import sympy as sp
from sympy.parsing.latex import parse_latex

x, t, k, p, r, h, y = sp.symbols("x t k p r h y", real=True)


def load_json(path: pathlib.Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: pathlib.Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def strip_inline_math(statement: str) -> str:
    return statement.strip().strip("$").strip()


def extract_display_math(statement: str) -> list[str]:
    return [block.strip() for block in re.findall(r"\\\[(.*?)\\\]", statement, flags=re.S)]


def parse_math(latex_source: str) -> Any:
    expr = parse_latex(latex_source.strip())
    if hasattr(expr, "free_symbols"):
        for symbol in list(expr.free_symbols):
            if getattr(symbol, "name", "") == "e":
                expr = expr.subs(symbol, sp.E)
    return sp.nsimplify(expr)


def latex_of(expr: Any) -> str:
    return sp.latex(sp.simplify(expr))


def wrap_display(lines: list[str] | str) -> str:
    body = "\n".join(lines) if isinstance(lines, list) else str(lines)
    return "\\[\n" + body.strip() + "\n\\]"


def math_answer(expr: Any, include_approx: bool = False) -> str:
    simplified = sp.simplify(expr)
    exact = latex_of(simplified)
    if include_approx and simplified.is_number:
        approx = sp.N(simplified, 6)
        if sp.simplify(approx - simplified) != 0:
            return f"${exact} \\approx {sp.latex(approx)}$"
    return f"${exact}$"


def plus_c(expr: Any) -> str:
    return f"${latex_of(expr)} + C$"


def interval_union(intervals: list[tuple[Any, Any, bool, bool]]) -> str:
    rendered = []
    for left, right, left_open, right_open in intervals:
        left_bracket = "(" if left_open else "["
        right_bracket = ")" if right_open else "]"
        rendered.append(
            f"{left_bracket}{sp.latex(left) if left not in (-sp.oo, sp.oo) else ('-\\infty' if left == -sp.oo else '\\infty')}, "
            f"{sp.latex(right) if right not in (-sp.oo, sp.oo) else ('-\\infty' if right == -sp.oo else '\\infty')}{right_bracket}"
        )
    return "$" + " \\cup ".join(rendered) + "$"


def result(
    answer: str,
    solution_latex: str,
    *,
    confidence: float = 0.97,
    concept_summary: str | None = None,
    method_steps: list[str] | None = None,
    problem_analysis: str | None = None,
) -> dict[str, Any]:
    payload: dict[str, Any] = {
        "solved": True,
        "expected_answer": answer,
        "full_solution_latex": solution_latex,
        "solution_confidence": confidence,
    }
    if concept_summary:
        payload["concept_summary"] = concept_summary
    if method_steps:
        payload["method_steps"] = method_steps
    if problem_analysis:
        payload["problem_analysis"] = problem_analysis
    return payload


def blocked(note: str) -> dict[str, Any]:
    return {
        "solved": False,
        "solver_note": note,
        "solution_confidence": 0.1,
    }


def solve_symbolic_item(item: dict[str, Any]) -> dict[str, Any]:
    expr = parse_math(strip_inline_math(item["statement"]))

    if isinstance(expr, sp.Limit):
        answer = sp.nsimplify(expr.doit())
        return result(
            math_answer(answer, include_approx=True),
            wrap_display(
                [
                    f"{sp.latex(expr)} = {latex_of(answer)}",
                ]
            ),
            concept_summary="Evaluate the limit by simplifying the expression and applying the relevant limit rule.",
        )

    if isinstance(expr, sp.Derivative):
        answer = sp.nsimplify(expr.doit())
        return result(
            math_answer(answer),
            wrap_display(
                [
                    f"{sp.latex(expr)} = {latex_of(answer)}",
                ]
            ),
            concept_summary="Differentiate the expression using the derivative rule that matches the structure of the function.",
        )

    if isinstance(expr, sp.Integral):
        antiderivative = sp.nsimplify(expr.doit())
        answer = plus_c(antiderivative)
        return result(
            answer,
            wrap_display(
                [
                    f"{sp.latex(expr)} = {latex_of(antiderivative)} + C",
                ]
            ),
            concept_summary="Find an antiderivative and include the constant of integration.",
        )

    return blocked("The symbolic item was not recognized as a limit, derivative, or integral.")


def solve_continuity_integrals(item: dict[str, Any]) -> dict[str, Any]:
    raw_label = str(item.get("raw_label", "")).strip()

    if raw_label == "1":
        return result(
            "$f$ is not continuous at $x=1$, but it can be made continuous by defining $f(1)=2$.",
            wrap_display(
                [
                    r"f(x)=\frac{x^2-1}{x-1}=\frac{(x-1)(x+1)}{x-1}=x+1 \qquad (x\neq 1),",
                    r"\lim_{x\to 1} f(x)=\lim_{x\to 1}(x+1)=2.",
                    r"The original formula is undefined at x=1, so the discontinuity is removable.",
                    r"Define\ f(1)=2\ to make the function continuous at x=1.",
                ]
            ),
        )

    if raw_label == "2":
        return result(
            "$k=0$.",
            wrap_display(
                [
                    r"\lim_{x\to 2^-} f(x)=2^2+2k=4+2k,",
                    r"\lim_{x\to 2^+} f(x)=3(2)-2=4.",
                    r"For continuity at x=2,\ 4+2k=4 \Rightarrow k=0.",
                ]
            ),
        )

    if raw_label == "3":
        return result(
            "The points of discontinuity are $x=-2$ and $x=2$.",
            wrap_display(
                [
                    r"f(x)=\frac{1}{x^2-4}=\frac{1}{(x-2)(x+2)}.",
                    r"The function is undefined when x^2-4=0, so x=\pm 2.",
                    r"Therefore the discontinuities occur at x=-2 and x=2.",
                ]
            ),
        )

    if raw_label == "4":
        return result(
            r"The domain is $[1,\infty)$, and $f(x)=\sqrt{x-1}$ is continuous on its entire domain.",
            wrap_display(
                [
                    r"x-1 \ge 0 \Rightarrow x \ge 1,",
                    r"so the domain is [1,\infty).",
                    r"The square-root function is continuous where its input is nonnegative,",
                    r"therefore \sqrt{x-1}\ is continuous on [1,\infty).",
                ]
            ),
        )

    if raw_label == "5":
        return result(
            "Any real value of $k$ makes the function continuous at $x=0$.",
            wrap_display(
                [
                    r"\lim_{x\to 0^-} f(x)=\lim_{x\to 0^-}\sin x=0,",
                    r"\lim_{x\to 0^+} f(x)=\lim_{x\to 0^+}kx=0,",
                    r"and\ f(0)=k\cdot 0=0.",
                    r"Both one-sided limits and the function value equal 0,",
                    r"so the function is continuous at x=0 for every real k.",
                ]
            ),
        )

    if raw_label == "6":
        value = sp.integrate(x**2, (x, 0, 3))
        return result(
            math_answer(value),
            wrap_display(
                [
                    r"\text{Area}=\int_0^3 x^2\,dx=\left[\frac{x^3}{3}\right]_0^3=\frac{27}{3}=9.",
                ]
            ),
        )

    if raw_label == "7":
        value = sp.integrate(2 * x - x**2, (x, 0, 2))
        return result(
            math_answer(value),
            wrap_display(
                [
                    r"x^2=2x \Rightarrow x(x-2)=0 \Rightarrow x=0,2.",
                    r"\text{Area}=\int_0^2 (2x-x^2)\,dx=\left[x^2-\frac{x^3}{3}\right]_0^2=\frac{4}{3}.",
                ]
            ),
        )

    if raw_label == "8":
        value = sp.integrate(sp.sin(x), (x, 0, sp.pi))
        return result(
            math_answer(value),
            wrap_display(
                [
                    r"\text{Area}=\int_0^{\pi}\sin x\,dx=\left[-\cos x\right]_0^{\pi}=(-(-1))-(-1)=2.",
                ]
            ),
        )

    if raw_label == "9":
        value = sp.integrate(3 * t**2 - 6 * t, (t, 0, 3))
        return result(
            math_answer(value),
            wrap_display(
                [
                    r"\text{Displacement}=\int_0^3 (3t^2-6t)\,dt=\left[t^3-3t^2\right]_0^3=27-27=0.",
                ]
            ),
        )

    if raw_label == "10":
        value = sp.integrate(4 + 2 * t, (t, 0, 5))
        return result(
            math_answer(value),
            wrap_display(
                [
                    r"\text{Total water}=\int_0^5 (4+2t)\,dt=\left[4t+t^2\right]_0^5=20+25=45.",
                ]
            ),
        )

    return blocked("No continuity/integral-applications handler matched this item.")


def solve_applied_set(item: dict[str, Any]) -> dict[str, Any]:
    raw_label = str(item.get("raw_label", "")).strip()

    if raw_label == "1":
        velocity = sp.Rational(20) - sp.Rational(49, 5) * t
        v_at_2 = sp.simplify(velocity.subs(t, 2))
        t_vertex = sp.Rational(100, 49)
        max_height = sp.simplify((20 * t - sp.Rational(49, 10) * t**2).subs(t, t_vertex))
        return result(
            f"$v(t)={latex_of(velocity)}$, $v(2)={latex_of(v_at_2)}$, and the maximum height is ${latex_of(max_height)} \\approx {sp.latex(sp.N(max_height, 6))}$ m.",
            wrap_display(
                [
                    r"s(t)=20t-\frac{49}{10}t^2,",
                    rf"v(t)=s'(t)={latex_of(velocity)}.",
                    rf"v(2)=20-\frac{{49}}{{5}}(2)={latex_of(v_at_2)}.",
                    rf"To find the maximum height, solve\ v(t)=0:",
                    rf"20-\frac{{49}}{{5}}t=0 \Rightarrow t=\frac{{100}}{{49}}.",
                    rf"s\!\left(\frac{{100}}{{49}}\right)={latex_of(max_height)} \approx {sp.latex(sp.N(max_height, 6))}.",
                ]
            ),
        )

    if raw_label == "2":
        velocity = sp.diff(t**3 - 6 * t**2 + 9 * t + 1, t)
        roots = sorted(sp.solve(sp.Eq(velocity, 0), t), key=sp.default_sort_key)
        return result(
            "The particle is at rest at $t=1$ and $t=3$.",
            wrap_display(
                [
                    rf"v(t)=s'(t)={latex_of(velocity)}={latex_of(sp.factor(velocity))}.",
                    r"Set\ v(t)=0:",
                    rf"{latex_of(sp.factor(velocity))}=0 \Rightarrow t=1,\ 3.",
                ]
            ),
        )

    if raw_label == "3":
        marginal = 12 + sp.Rational(1, 25) * x
        estimate = marginal.subs(x, 100)
        return result(
            f"The marginal cost is $C'(x)={latex_of(marginal)}$, and the estimated cost of the $101$st unit is ${latex_of(estimate)}$ dollars.",
            wrap_display(
                [
                    r"C(x)=500+12x+\frac{1}{50}x^2,",
                    rf"C'(x)={latex_of(marginal)}.",
                    r"The additional cost of producing the 101st unit is approximated by\ C'(100).",
                    rf"C'(100)={latex_of(estimate)}.",
                ]
            ),
        )

    if raw_label == "4":
        revenue = 30 * x - sp.Rational(1, 20) * x**2
        marginal = sp.diff(revenue, x)
        x_star = sp.solve(sp.Eq(marginal, 0), x)[0]
        return result(
            f"The marginal revenue is $R'(x)={latex_of(marginal)}$, and revenue is maximized at $x={latex_of(x_star)}$ units.",
            wrap_display(
                [
                    rf"R'(x)={latex_of(marginal)}.",
                    rf"Set\ R'(x)=0:\ {latex_of(marginal)}=0 \Rightarrow x={latex_of(x_star)}.",
                    r"Because the revenue function is a downward-opening quadratic, this critical point gives the maximum revenue.",
                ]
            ),
        )

    if raw_label == "5":
        x_star = sp.solve(sp.Eq(sp.diff(-sp.Rational(1, 100) * x**2 + 8 * x - 200, x), 0), x)[0]
        return result(
            f"The profit is maximized at the production level $x={latex_of(x_star)}$.",
            wrap_display(
                [
                    r"P(x)=-\frac{1}{100}x^2+8x-200,",
                    r"P'(x)=-\frac{1}{50}x+8.",
                    rf"Set\ P'(x)=0:\ -\frac{{1}}{{50}}x+8=0 \Rightarrow x={latex_of(x_star)}.",
                    r"Since the parabola opens downward, this critical point gives the maximum profit.",
                ]
            ),
        )

    if raw_label == "6":
        V = x * (20 - 2 * x) ** 2
        critical = [value for value in sp.solve(sp.Eq(sp.diff(V, x), 0), x) if value.is_real][0]
        critical = sp.simplify(sp.Rational(10, 3))
        return result(
            rf"$V(x)={latex_of(sp.expand(V))}=x(20-2x)^2$, and the volume is maximized at $x={latex_of(critical)}$ cm.",
            wrap_display(
                [
                    r"V(x)=x(20-2x)^2.",
                    rf"V'(x)={latex_of(sp.factor(sp.diff(V, x)))}.",
                    rf"Set\ V'(x)=0:\ {latex_of(sp.factor(sp.diff(V, x)))}=0.",
                    rf"The feasible critical point is\ x={latex_of(critical)}.",
                ]
            ),
        )

    if raw_label == "7":
        return result(
            "The area is maximized by a $50$ m by $50$ m field.",
            wrap_display(
                [
                    r"Let the sides be x and y. Then 2x+2y=200, so x+y=100 and y=100-x.",
                    r"A(x)=x(100-x)=100x-x^2.",
                    r"A'(x)=100-2x=0 \Rightarrow x=50,\ y=50.",
                ]
            ),
        )

    if raw_label == "8":
        return result(
            "The maximum-area rectangle has width $4$ and height $8$.",
            wrap_display(
                [
                    r"If the top corners are at (\pm x,\,12-x^2), then the rectangle has width 2x and height 12-x^2.",
                    r"A(x)=2x(12-x^2)=24x-2x^3.",
                    r"A'(x)=24-6x^2=0 \Rightarrow x=2.",
                    r"So the width is 2(2)=4 and the height is 12-2^2=8.",
                ]
            ),
        )

    if raw_label == "9":
        return result(
            "Revenue is maximized when $x=25$ units are sold.",
            wrap_display(
                [
                    r"R(x)=x\,p(x)=x(100-2x)=100x-2x^2.",
                    r"R'(x)=100-4x=0 \Rightarrow x=25.",
                    r"Since the revenue function is a downward-opening quadratic, x=25 gives the maximum revenue.",
                ]
            ),
        )

    if raw_label == "10":
        value = sp.simplify(sp.Rational(1, 2) / sp.pi)
        return result(
            f"The water level is rising at {math_answer(value, include_approx=True)} m/min.",
            wrap_display(
                [
                    r"\frac{r}{h}=\frac{3}{6}=\frac{1}{2},\quad r=\frac{h}{2}.",
                    r"V=\frac{1}{3}\pi r^2 h=\frac{1}{3}\pi \left(\frac{h}{2}\right)^2 h=\frac{\pi}{12}h^3.",
                    r"\frac{dV}{dt}=\frac{\pi}{4}h^2\frac{dh}{dt}.",
                    r"When\ h=4\ and\ \frac{dV}{dt}=2,",
                    rf"2=\frac{{\pi}}{{4}}(16)\frac{{dh}}{{dt}}=4\pi \frac{{dh}}{{dt}} \Rightarrow \frac{{dh}}{{dt}}={latex_of(value)}.",
                ]
            ),
        )

    if raw_label == "11":
        value = sp.simplify(100 / (4 * sp.pi * 5**2))
        return result(
            f"The radius is increasing at {math_answer(value, include_approx=True)} cm/s.",
            wrap_display(
                [
                    r"V=\frac{4}{3}\pi r^3 \Rightarrow \frac{dV}{dt}=4\pi r^2 \frac{dr}{dt}.",
                    rf"100=4\pi(5)^2\frac{{dr}}{{dt}}=100\pi \frac{{dr}}{{dt}}.",
                    rf"So\ \frac{{dr}}{{dt}}={latex_of(value)}.",
                ]
            ),
        )

    if raw_label == "12":
        value = sp.Rational(-3, 4)
        return result(
            f"The top of the ladder is sliding down at {math_answer(value)} m/s.",
            wrap_display(
                [
                    r"x^2+y^2=10^2=100.",
                    r"When\ x=6,\ y=\sqrt{100-36}=8.",
                    r"Differentiate:\ 2x\frac{dx}{dt}+2y\frac{dy}{dt}=0.",
                    rf"2(6)(1)+2(8)\frac{{dy}}{{dt}}=0 \Rightarrow \frac{{dy}}{{dt}}={latex_of(value)}.",
                ]
            ),
        )

    if raw_label == "13":
        left = sp.simplify(1 - 1 / sp.sqrt(3))
        right = sp.simplify(1 + 1 / sp.sqrt(3))
        return result(
            f"The car moves forward on {interval_union([(-sp.oo, left, True, True), (right, sp.oo, True, True)])} and backward on {interval_union([(left, right, True, True)])}.",
            wrap_display(
                [
                    r"v(t)=s'(t)=3t^2-6t+2.",
                    r"3t^2-6t+2=0 \Rightarrow t=1\pm \frac{1}{\sqrt{3}}.",
                    r"Since the quadratic opens upward, v(t)>0 outside the roots and v(t)<0 between the roots.",
                ]
            ),
        )

    if raw_label == "14":
        rate_expr = -6 * sp.exp(-sp.Rational(1, 10) * t)
        rate_5 = sp.simplify(rate_expr.subs(t, 5))
        return result(
            f"$T(0)=85$, $T'(t)={latex_of(rate_expr)}$, and $T'(5)={latex_of(rate_5)} \\approx {sp.latex(sp.N(rate_5, 6))}$.",
            wrap_display(
                [
                    r"T(0)=25+60e^0=85.",
                    rf"T'(t)={latex_of(rate_expr)}.",
                    rf"T'(5)={latex_of(rate_5)} \approx {sp.latex(sp.N(rate_5, 6))}.",
                ]
            ),
        )

    if raw_label == "15":
        growth = 30 * sp.exp(sp.Rational(3, 100) * t)
        pop10 = 1000 * sp.exp(sp.Rational(3, 10))
        return result(
            f"The growth rate is $P'(t)={latex_of(growth)}$, and $P(10)={latex_of(pop10)} \\approx {sp.latex(sp.N(pop10, 6))}$.",
            wrap_display(
                [
                    rf"P'(t)={latex_of(growth)}.",
                    rf"P(10)=1000e^{{0.3}}={latex_of(pop10)} \approx {sp.latex(sp.N(pop10, 6))}.",
                ]
            ),
        )

    if raw_label == "16":
        rate = -40 * sp.exp(-sp.Rational(2, 25) * t)
        rate_6 = sp.simplify(rate.subs(t, 6))
        return result(
            f"The amount is changing at $A'(6)={latex_of(rate_6)} \\approx {sp.latex(sp.N(rate_6, 6))}$ units per time unit.",
            wrap_display(
                [
                    rf"A'(t)={latex_of(rate)}.",
                    rf"A'(6)={latex_of(rate_6)} \approx {sp.latex(sp.N(rate_6, 6))}.",
                ]
            ),
        )

    if raw_label == "17":
        return result(
            "The pollutant amount is increasing for $t<20$ and decreasing for $t>20$.",
            wrap_display(
                [
                    r"Q'(t)=20-t.",
                    r"Q'(t)>0 \text{ when } t<20,\quad Q'(t)<0 \text{ when } t>20.",
                    r"So the pollutant amount increases before t=20 and decreases after t=20.",
                ]
            ),
        )

    if raw_label == "18":
        x_star = sp.simplify(sp.Rational(1250, 3))
        return result(
            f"Profit is maximized at the production level $x={latex_of(x_star)} \\approx {sp.latex(sp.N(x_star, 6))}$ units.",
            wrap_display(
                [
                    r"P(x)=R(x)-C(x)=(40x-0.02x^2)-(1000+15x+0.01x^2).",
                    r"So\ P(x)=-0.03x^2+25x-1000.",
                    r"P'(x)=-0.06x+25=0 \Rightarrow x=\frac{25}{0.06}=\frac{1250}{3}.",
                    r"Because the quadratic opens downward, this critical point maximizes profit.",
                ]
            ),
        )

    if raw_label == "19":
        radius = sp.simplify(10 / (4 + sp.pi))
        width = sp.simplify(2 * radius)
        return result(
            f"The maximizing dimensions are rectangle width ${latex_of(width)}$, rectangle height ${latex_of(radius)}$, and semicircle radius ${latex_of(radius)}$.",
            wrap_display(
                [
                    r"Let r be the semicircle radius and h the rectangle height.",
                    r"Then the width is 2r and the perimeter condition is 2h+2r+\pi r=10.",
                    r"So\ h=\frac{10-(2+\pi)r}{2}.",
                    r"A(r)=2rh+\frac{1}{2}\pi r^2=10r-\left(2+\frac{\pi}{2}\right)r^2.",
                    rf"A'(r)=10-(4+\pi)r=0 \Rightarrow r={latex_of(radius)}.",
                    rf"Thus\ h={latex_of(radius)}\ and\ width=2r={latex_of(width)}.",
                ]
            ),
        )

    if raw_label == "20":
        radius = sp.simplify((sp.Rational(250) / sp.pi) ** sp.Rational(1, 3))
        height = sp.simplify(2 * radius)
        return result(
            f"The minimum-surface-area can has radius ${latex_of(radius)}$ and height ${latex_of(height)}$.",
            wrap_display(
                [
                    r"Use the volume constraint \pi r^2 h=500,\ so\ h=\frac{500}{\pi r^2}.",
                    r"S(r)=2\pi r^2+2\pi r h=2\pi r^2+\frac{1000}{r}.",
                    r"S'(r)=4\pi r-\frac{1000}{r^2}=0 \Rightarrow 4\pi r^3=1000.",
                    rf"r={latex_of(radius)},\quad h=\frac{{500}}{{\pi r^2}}={latex_of(height)}.",
                ]
            ),
        )

    if raw_label == "21":
        return result(
            "The maximum height is $100$, the projectile hits the ground at $t=5$, and $v(1)=48$.",
            wrap_display(
                [
                    r"h(t)=80t-16t^2,\quad v(t)=h'(t)=80-32t.",
                    r"For the maximum height, set\ v(t)=0:\ 80-32t=0 \Rightarrow t=\frac{5}{2}.",
                    r"h\!\left(\frac{5}{2}\right)=80\left(\frac{5}{2}\right)-16\left(\frac{5}{2}\right)^2=100.",
                    r"To hit the ground, solve\ h(t)=0:\ 16t(5-t)=0 \Rightarrow t=5 \text{ after launch}.",
                    r"Finally,\ v(1)=80-32=48.",
                ]
            ),
        )

    if raw_label == "22":
        return result(
            "The average velocity on $[1,3]$ is $18$, and the instantaneous velocity at $t=2$ is also $18$.",
            wrap_display(
                [
                    r"s(3)=4(9)+2(3)=42,\quad s(1)=4(1)+2(1)=6.",
                    r"\text{Average velocity}=\frac{s(3)-s(1)}{3-1}=\frac{42-6}{2}=18.",
                    r"v(t)=s'(t)=8t+2,\quad v(2)=16+2=18.",
                ]
            ),
        )

    if raw_label == "23":
        return result(
            "The tank contains the maximum amount of water at $t=12.5$.",
            wrap_display(
                [
                    r"V(t)=50+10t-0.4t^2,\quad V'(t)=10-0.8t.",
                    r"Set\ V'(t)=0:\ 10-0.8t=0 \Rightarrow t=12.5.",
                    r"Because the quadratic opens downward, this time gives the maximum amount of water.",
                ]
            ),
        )

    if raw_label == "24":
        return result(
            "The concentration is greatest at $t=2$.",
            wrap_display(
                [
                    r"C(t)=5te^{-0.5t}.",
                    r"C'(t)=5e^{-0.5t}-2.5te^{-0.5t}=5e^{-0.5t}(1-0.5t).",
                    r"Set\ C'(t)=0:\ 1-0.5t=0 \Rightarrow t=2.",
                ]
            ),
        )

    if raw_label == "25":
        return result(
            "The maximum-area pen uses width $25$ m perpendicular to the river and length $50$ m parallel to the river.",
            wrap_display(
                [
                    r"Let x be the width perpendicular to the river and y the length parallel to the river.",
                    r"Then 2x+y=100,\ so\ y=100-2x.",
                    r"A(x)=xy=x(100-2x)=100x-2x^2.",
                    r"A'(x)=100-4x=0 \Rightarrow x=25,\ y=50.",
                ]
            ),
        )

    if raw_label == "26":
        return result(
            "The revenue function is $R(p)=500p-20p^2$, and revenue is maximized at the price $p=12.5$.",
            wrap_display(
                [
                    r"R(p)=p\,x=p(500-20p)=500p-20p^2.",
                    r"R'(p)=500-40p=0 \Rightarrow p=12.5.",
                    r"Since the quadratic opens downward, this price maximizes revenue.",
                ]
            ),
        )

    if raw_label == "27":
        return result(
            "The tangent line is $y=4x-3$, and its slope $4$ is the instantaneous rate of change of the curve at $x=2$.",
            wrap_display(
                [
                    r"y=x^2+1 \Rightarrow y'=2x.",
                    r"At\ x=2,\ slope=2(2)=4\ and\ the point on the curve is\ (2,5).",
                    r"Using point-slope form,",
                    r"y-5=4(x-2) \Rightarrow y=4x-3.",
                ]
            ),
        )

    if raw_label == "28":
        return result(
            "The velocity is $v(t)=\\cos t-\\sin t$, and the acceleration is $a(t)=-\\sin t-\\cos t$.",
            wrap_display(
                [
                    r"v(t)=s'(t)=\cos t-\sin t.",
                    r"a(t)=v'(t)=-\sin t-\cos t.",
                ]
            ),
        )

    if raw_label == "29":
        return result(
            "The area is increasing at $60\\pi$ cm$^2$/s when the radius is $10$ cm.",
            wrap_display(
                [
                    r"A=\pi r^2 \Rightarrow \frac{dA}{dt}=2\pi r\frac{dr}{dt}.",
                    r"When\ r=10\ and\ \frac{dr}{dt}=3,",
                    r"\frac{dA}{dt}=2\pi(10)(3)=60\pi.",
                ]
            ),
        )

    if raw_label == "30":
        return result(
            "The area is increasing at $20$ cm$^2$/s.",
            wrap_display(
                [
                    r"A=s^2 \Rightarrow \frac{dA}{dt}=2s\frac{ds}{dt}.",
                    r"When\ s=5\ and\ \frac{ds}{dt}=2,",
                    r"\frac{dA}{dt}=2(5)(2)=20.",
                ]
            ),
        )

    if raw_label == "31":
        return result(
            "The circumference is changing at $-0.8\\pi$ cm/s.",
            wrap_display(
                [
                    r"C=2\pi r \Rightarrow \frac{dC}{dt}=2\pi \frac{dr}{dt}.",
                    r"When\ \frac{dr}{dt}=-0.4,",
                    r"\frac{dC}{dt}=2\pi(-0.4)=-0.8\pi.",
                ]
            ),
        )

    if raw_label == "32":
        return result(
            "The volume is changing at $32\\pi$ m$^3$/s.",
            wrap_display(
                [
                    r"V=\frac{4}{3}\pi r^3 \Rightarrow \frac{dV}{dt}=4\pi r^2 \frac{dr}{dt}.",
                    r"When\ r=4\ and\ \frac{dr}{dt}=0.5,",
                    r"\frac{dV}{dt}=4\pi(4^2)(0.5)=32\pi.",
                ]
            ),
        )

    if raw_label == "33":
        return result(
            "The rate of change of volume is $\\dfrac{dV}{dt}=3x^2\\dfrac{dx}{dt}$.",
            wrap_display(
                [
                    r"V=x^3.",
                    r"Differentiate with respect to time:",
                    r"\frac{dV}{dt}=3x^2\frac{dx}{dt}.",
                ]
            ),
        )

    if raw_label == "34":
        return result(
            "There are no real break-even points.",
            wrap_display(
                [
                    r"Set\ C(x)=R(x):\ 2000+25x=50x-0.1x^2.",
                    r"Rearrange:\ 0.1x^2-25x+2000=0.",
                    r"Multiply by 10:\ x^2-250x+20000=0.",
                    r"The discriminant is\ 250^2-4(1)(20000)=-17500<0,",
                    r"so there are no real break-even points.",
                ]
            ),
        )

    if raw_label == "35":
        return result(
            "The local maximum value is $21$ at $x=-2$, and the local minimum value is $-11$ at $x=2$.",
            wrap_display(
                [
                    r"f'(x)=3x^2-12=3(x-2)(x+2).",
                    r"So the critical points are\ x=\pm 2.",
                    r"f''(x)=6x.",
                    r"At\ x=-2,\ f''(-2)=-12<0,\ so there is a local maximum and\ f(-2)=21.",
                    r"At\ x=2,\ f''(2)=12>0,\ so there is a local minimum and\ f(2)=-11.",
                ]
            ),
        )

    if raw_label == "36":
        return result(
            "The minimum-material box has base side length $6$ cm and height $3$ cm.",
            wrap_display(
                [
                    r"Let x be the side length of the square base and h the height.",
                    r"Volume constraint:\ x^2 h=108 \Rightarrow h=\frac{108}{x^2}.",
                    r"Since the box has no lid, the surface area is",
                    r"S(x)=x^2+4xh=x^2+\frac{432}{x}.",
                    r"S'(x)=2x-\frac{432}{x^2}=0 \Rightarrow 2x^3=432 \Rightarrow x=6.",
                    r"Then\ h=\frac{108}{6^2}=3.",
                ]
            ),
        )

    if raw_label == "37":
        accel = 12 * t**2 - 48 * t + 36
        return result(
            f"The acceleration is $a(t)={latex_of(accel)}$, and for $t>0$ the train does not change direction because $v(t)=4t(t-3)^2\\ge 0$.",
            wrap_display(
                [
                    r"v(t)=s'(t)=4t^3-24t^2+36t=4t(t-3)^2.",
                    rf"a(t)=v'(t)={latex_of(accel)}.",
                    r"For t>0,\ v(t)=4t(t-3)^2 \ge 0, and it only equals 0 at t=3 without changing sign.",
                    r"So the train does not reverse direction for positive time.",
                ]
            ),
        )

    if raw_label == "38":
        return result(
            "The velocity is $v(t)=-\\dfrac{1}{(t+1)^2}$, and the particle is slowing down at $t=1$.",
            wrap_display(
                [
                    r"v(t)=s'(t)=-\frac{1}{(t+1)^2}.",
                    r"a(t)=v'(t)=\frac{2}{(t+1)^3}.",
                    r"At\ t=1,\ v(1)=-\frac{1}{4}<0\ and\ a(1)=\frac{1}{4}>0.",
                    r"Velocity and acceleration have opposite signs, so the particle is slowing down.",
                ]
            ),
        )

    if raw_label == "39":
        return result(
            "The cost function is $C(x)=300+10x+0.02x^2$.",
            wrap_display(
                [
                    r"C'(x)=10+0.04x.",
                    r"Integrate:\ C(x)=10x+0.02x^2 + K.",
                    r"Fixed cost means\ C(0)=300,\ so K=300.",
                    r"Therefore\ C(x)=300+10x+0.02x^2.",
                ]
            ),
        )

    if raw_label == "40":
        return result(
            "The revenue function is $R(x)=100x-0.1x^2$.",
            wrap_display(
                [
                    r"R'(x)=100-0.2x.",
                    r"Integrate:\ R(x)=100x-0.1x^2+K.",
                    r"Since\ R(0)=0,\ K=0.",
                    r"So\ R(x)=100x-0.1x^2.",
                ]
            ),
        )

    if raw_label == "41":
        return result(
            "The total amount of water added in the first $4$ minutes is $36$ liters.",
            wrap_display(
                [
                    r"\int_0^4 (5+2t)\,dt=\left[5t+t^2\right]_0^4=20+16=36.",
                ]
            ),
        )

    if raw_label == "42":
        return result(
            "The position function is $s(t)=t^3-3t^2+2t+5$.",
            wrap_display(
                [
                    r"s'(t)=v(t)=3t^2-6t+2.",
                    r"Integrate:\ s(t)=t^3-3t^2+2t+C.",
                    r"Use\ s(0)=5 \Rightarrow C=5.",
                    r"So\ s(t)=t^3-3t^2+2t+5.",
                ]
            ),
        )

    if raw_label == "43":
        return result(
            "The work done is $24$.",
            wrap_display(
                [
                    r"W=\int_1^4 (2x+3)\,dx=\left[x^2+3x\right]_1^4=(16+12)-(1+3)=24.",
                ]
            ),
        )

    if raw_label == "44":
        return result(
            "The learning model is $L(t)=30-20e^{-0.2t}$.",
            wrap_display(
                [
                    r"L'(t)=4e^{-0.2t}.",
                    r"Integrate:\ L(t)=-20e^{-0.2t}+K.",
                    r"Use\ L(0)=10:\ -20+K=10 \Rightarrow K=30.",
                    r"So\ L(t)=30-20e^{-0.2t}.",
                ]
            ),
        )

    if raw_label == "45":
        change = sp.integrate(50 - sp.Rational(1, 2) * x, (x, 20, 60))
        return result(
            f"The profit increases by ${latex_of(change)}$.",
            wrap_display(
                [
                    r"\Delta P=\int_{20}^{60} (50-0.5x)\,dx.",
                    r"=\left[50x-\frac{x^2}{4}\right]_{20}^{60}",
                    rf"={latex_of(change)}.",
                ]
            ),
        )

    if raw_label == "46":
        return result(
            "The total distance traveled on $[0,4]$ is $4$.",
            wrap_display(
                [
                    r"v(t)=t^2-4t+3=(t-1)(t-3).",
                    r"The speed changes sign at t=1 and t=3, so compute distance with absolute value on each interval:",
                    r"\text{Distance}=\int_0^1 v(t)\,dt-\int_1^3 v(t)\,dt+\int_3^4 v(t)\,dt.",
                    r"Using\ F(t)=\frac{t^3}{3}-2t^2+3t,",
                    r"\text{Distance}=\left[F(t)\right]_0^1-\left[F(t)\right]_1^3+\left[F(t)\right]_3^4=4.",
                ]
            ),
        )

    return blocked("No applied-problem-set handler matched this item.")


def solve_item(item: dict[str, Any]) -> dict[str, Any]:
    source = item.get("source")
    if source == "Calculus 1 Problem Set (100 Problems)":
        return solve_symbolic_item(item)
    if source == "Calculus 1 Continuity and Applications of Integrals Problem Set":
        return solve_continuity_integrals(item)
    if source == "Calculus 1 Applied Problem Set":
        return solve_applied_set(item)
    if source == "OpenStax":
        return blocked("The retrieved OpenStax item is too incomplete to solve reliably and should be reviewed or replaced.")
    return blocked(f"No solver is available for source: {source}")


def merge_solution_payload(draft: dict[str, Any], solved: dict[str, Any]) -> dict[str, Any]:
    source_refs = dict(draft.get("source_refs") or {})
    source_refs["solver_engine"] = "sympy+heuristics"

    if not solved.get("solved"):
        source_refs["solver_status"] = "blocked"
        source_refs["solver_note"] = solved.get("solver_note")
        draft["solution_confidence"] = solved.get("solution_confidence", draft.get("solution_confidence", 0.1))
        draft["source_refs"] = source_refs
        return draft

    source_refs["solver_status"] = "solved"
    draft["expected_answer"] = solved["expected_answer"]
    draft["full_solution_latex"] = solved["full_solution_latex"]
    draft["solution_status"] = "drafted"
    draft["solution_confidence"] = solved.get("solution_confidence", draft.get("solution_confidence", 0.9))
    draft["source_refs"] = source_refs

    profiles = dict(draft.get("downstream_profiles") or {})
    if "quick_check" in profiles:
        profiles["quick_check"]["answer_only"] = solved["expected_answer"]
    if "module_checkpoint" in profiles:
        profiles["module_checkpoint"]["answer"] = solved["expected_answer"]
        if solved.get("concept_summary"):
            profiles["module_checkpoint"]["concept_summary"] = solved["concept_summary"]
    if "active_learning_task" in profiles:
        profiles["active_learning_task"]["answer"] = solved["expected_answer"]
        if solved.get("problem_analysis"):
            profiles["active_learning_task"]["problem_analysis"] = solved["problem_analysis"]
        if solved.get("method_steps"):
            profiles["active_learning_task"]["method_steps"] = solved["method_steps"]
    if "sbra_exercise_bank" in profiles:
        profiles["sbra_exercise_bank"]["answer"] = solved["expected_answer"]
        if solved.get("problem_analysis"):
            profiles["sbra_exercise_bank"]["problem_analysis"] = solved["problem_analysis"]
    draft["downstream_profiles"] = profiles
    return draft


def main() -> None:
    parser = argparse.ArgumentParser(description="Solve a course problem pool and merge real answers into solution drafts.")
    parser.add_argument("--problem-pool", required=True)
    parser.add_argument("--solution-drafts", required=True)
    args = parser.parse_args()

    pool_path = pathlib.Path(args.problem_pool)
    drafts_path = pathlib.Path(args.solution_drafts)

    pool = load_json(pool_path)
    drafts_payload = load_json(drafts_path)
    pool_map = {item["problem_id"]: item for item in pool.get("items", [])}

    solved_count = 0
    blocked_count = 0
    for draft in drafts_payload.get("drafts", []):
        item = pool_map.get(draft.get("problem_id"))
        if not item:
            continue
        solved = solve_item(item)
        merge_solution_payload(draft, solved)
        if solved.get("solved"):
            solved_count += 1
        else:
            blocked_count += 1

    drafts_payload["generated_at"] = datetime.datetime.now().isoformat()
    save_json(drafts_path, drafts_payload)
    print(json.dumps({"solved": solved_count, "blocked": blocked_count}, ensure_ascii=False))


if __name__ == "__main__":
    main()

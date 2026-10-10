"use strict"

Array.prototype.remove = function(elem)
{
	const index = this.indexOf(elem);
	if (index !== -1)
		this.splice(index, 1);
}

function isEmpty(obj)
{
	for (const property in obj)
	{
		if (Object.hasOwn(obj, property))
			return false;
	}
	return true;
}

class RGBA
{
	constructor(r, g, b, a = 1)
	{
		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}
	setAlpha(a)
	{
		this.a = a;
	}
	toString()
	{
		const hasAlpha = this.a < 1;
		return (hasAlpha ? "rgba(" : "rgb(") 
		+ this.r + ',' + this.g + ',' + this.b
		+ (hasAlpha ? "," + this.a : "")
		+ ")";
	}
}

// returns val or the min/max it is closest to. Flips inverted min/max values.
function clamp(min, max, val)
{
	if (min > max)
		return clamp(max, min, val);
	return Math.min(max, Math.max(min, val));
}

// Returns the linear interpolation of t from a to b (unclamped)
function lerp(a, b, t)
{
	return (1-t)*a + t*b;
}

// Returns the normalized value of t from the range [a,b]
function inverseLerp(a, b, t)
{
	return (t - a) / (b - a);
}

// Returns the lerp() of [y,z] using the normalized value of t in [a,b] as the param
function map(a, b, y, z, t)
{
	return lerp(y, z, inverseLerp(a, b, t));
}


// Returns true if n is an Number
function isNumber(n) { 
	return !isNaN(parseFloat(n)) && isFinite(n);
}

// Returns true if s is a String
function isString(s){
	return typeof(s) === 'string' || s instanceof String;
}

// Interprets passed string as an interger. Empty strings return 0, null string return NaN
function toInteger(str)
{
	if (str === '')
		return 0;
	else if (!str)
		return NaN;
	return Number.parseInt(str);
}

// Returns a random integer in the range [0,n)
function randomInt(n)  {
	return Math.floor(Math.random() * n);
}

// Automatically fits the 16:9 game board to the window without needing F11 fullscreen
function fitGameToWindow() {
	if (typeof window === "undefined" || !document || !document.documentElement) return;
	const W = window.innerWidth;
	const H = window.innerHeight;
	if (!W || !H) return;
	const baseH = W * 1080 / 1920;
	const scale = Math.min(1, H / baseH);
	const actualW = W * scale;
	const actualH = baseH * scale;
	const offsetX = (W - actualW) / 2;
	const offsetY = (H - actualH) / 2;

	document.documentElement.style.setProperty('--game-scale', scale);
	document.documentElement.style.setProperty('--game-offset-x', offsetX + 'px');
	document.documentElement.style.setProperty('--game-offset-y', offsetY + 'px');
}

if (typeof window !== "undefined") {
	window.addEventListener('resize', fitGameToWindow);
	window.addEventListener('DOMContentLoaded', fitGameToWindow);
	window.addEventListener('load', fitGameToWindow);
	fitGameToWindow();
}

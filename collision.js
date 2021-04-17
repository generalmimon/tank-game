/*
 * SPDX-FileCopyrightText: 2018 Andrew Sevenson <andrew@sevenson.com.au>
 * SPDX-FileCopyrightText: 2019 Petr Pucil <petr.pucil@seznam.cz>
 *
 * SPDX-License-Identifier: MIT
 */

var Vector = function(p1, p2) {
	this.x = (p1 && p2) ? p2.x-p1.x : (p1 ? p1.x : 0);
	this.y = (p1 && p2) ? p2.y-p1.y : (p1 ? p1.y : 0);
	this.length = Math.sqrt(this.x*this.x + this.y*this.y) || 0;
	this.plus = function(v2) {
		return new Vector(
			{x: this.x+v2.x, y: this.y+v2.y}
		);
	}
	this.minus = function(v2) {
		return new Vector(
			{x: this.x-v2.x, y: this.y-v2.y}
		);
	}
	this.multiply = function(num) {
		return new Vector(
			{x:this.x*num, y:this.y*num}
		);
	}
	this.normalize = function() {
		var len = this.length;
		if(len > 0) {
			return new Vector(
				{x: this.x / len, y: this.y / len}
			);
		} else {
			return false;
		}
	}
	this.leftHand = function() {
		return new Vector(
			{x:this.y, y:-this.x}
		);
	}
	this.rightHand = function() {
		return new Vector(
			{x:-this.y, y:this.x}
		);
	}
	this.dotProduct = function(v2) {
		return this.x*v2.x+this.y*v2.y;
	}
}
// taken from https://github.com/sevdanski/SAT_AS3 (just rewritten to JavaScript)
var Collision = new function() {
/*
circle format: {x: 20, y: 15, r: 5}
polygon format: {x: 110, y: 40, points: [{x: 10, y: 15}, {x: 20, y: 45}, {x: 40, y: 45}, ...]}
*/
	// static private
	function getAxisNormal(points, i) {
		var p1 = points[i],
			p2 = (i >= points.length - 1) ? points[0] : points[i + 1];
		var axis = new Vector(p1, p2).rightHand().normalize();
		return axis;
	}
	// static public
	this.circleToCircle = function(circ1, circ2) {
		var rsum = circ1.r + circ2.r;
		var dx = (circ2.x - circ1.x),
			dy = (circ2.y - circ1.y);
		var cdistsquared = (dx * dx) + (dy * dy),
			rsumsquared = rsum * rsum;
		if(cdistsquared > rsumsquared) {
			// gap found
			return null;
		}
		var result = {};
		var cv = new Vector(circ1, circ2);
		result.vector = cv.normalize();
		result.distance = cv.length - rsum;
		result.separation = result.vector.multiply(result.distance);
		result.shapeAContained = (circ1.r <= circ2.r && cv.length <= circ2.r-circ1.r);
		result.shapeBContained = (circ2.r <= circ1.r && cv.length <= circ1.r-circ2.r);
		return result;
	}
	this.polygonToPolygon = function(obj1, obj2) {
		var result = {shapeAContained: true, shapeBContained: true};
		var shortestDist = +Infinity;
		var obj1pnt = obj1.points,
			obj2pnt = obj2.points;
		var obj1pntlen = obj1pnt.length,
			obj2pntlen = obj2pnt.length;
		var vOffset = new Vector(obj1).minus(obj2);
		for(var i = 0; i < obj1pntlen; i++) {
			var axis = getAxisNormal(obj1pnt, i),
				min0, max0, min1, max1;
			min0 = max0 = axis.dotProduct(obj1pnt[0]);
			for (var a = 1; a < obj1pntlen; a++) {
				var t = axis.dotProduct(obj1pnt[a]);
				if (t < min0) min0 = t;
				if (t > max0) max0 = t;
			}
			min1 = max1 = axis.dotProduct(obj2pnt[0]);
			for (var b = 1; b < obj2pntlen; b++) {
				var t = axis.dotProduct(obj2pnt[b]);
				if (t < min1) min1 = t;
				if (t > max1) max1 = t;
			}
			var sOffset = axis.dotProduct(vOffset);
			min0 += sOffset;
			max0 += sOffset;
			var d0 = min0 - max1,
				d1 = min1 - max0;
			if (d0 > 0 || d1 > 0) {
				// gap found
				return null;
			}
			if (max0 < max1 || min0 > min1) result.shapeAContained = false;
			if (max1 < max0 || min1 > min0) result.shapeBContained = false;
			var distmin = d0,
				distminAbs = Math.abs(distmin);
			if (distminAbs < shortestDist) {
				// this distance is shorter so use it...
				result.distance = distmin;
				result.vector = axis;
				shortestDist = distminAbs;
			}
		}
		result.separation = result.vector.multiply(result.distance);
		return result;
	}
	this.circleToPolygon = function(circ, plg) {
		var result = {shapeAContained: true, shapeBContained: true},
			shortestDist = +Infinity;
		var plgpnt = plg.points;
		var plglen = plgpnt.length;
		var vOffset = new Vector(plg).minus(circ);
		var closestVertex = new Vector();
		var smallestPcDist = +Infinity;
		for(var a = 0; a < plglen; a++) {
			var dx = (circ.x - (plg.x + plgpnt[a].x)),
				dy = (circ.y - (plg.y + plgpnt[a].y));
			var pcDistSquared = (dx * dx + dy * dy);
			if(pcDistSquared < smallestPcDist) {
				closestVertex.x = plg.x + plgpnt[a].x;
				closestVertex.y = plg.y + plgpnt[a].y;
				smallestPcDist = pcDistSquared;
			}
		}
		var axis = closestVertex.minus(circ).normalize();
		var min0, max0, min1, max1;
		min0 = max0 = axis.dotProduct(plgpnt[0]);
		for (var b = 1; b < plglen; b++) {
			var t = axis.dotProduct(plgpnt[b]);
			if (t < min0) min0 = t;
			if (t > max0) max0 = t;
		}
		min1 = axis.dotProduct(new Vector({x:0, y:0}));
		max1 = min1 + circ.r;
		min1 -= circ.r;
		var sOffset = axis.dotProduct(vOffset);
		min0 += sOffset;
		max0 += sOffset;
		var d0 = min0 - max1,
			d1 = min1 - max0;
		if (d0 > 0 || d1 > 0) {
			// gap found
			return null;
		}
		if (max0 < max1 || min0 > min1) result.shapeAContained = false;
		if (max1 < max0 || min1 > min0) result.shapeBContained = false;
		var distmin = d0,
			distminAbs = Math.abs(distmin);
		result.distance = distmin;
		result.vector = axis;
		shortestDist = distminAbs;
		for(var i = 0; i < plglen; i++) {
			var axis = getAxisNormal(plgpnt, i),
				min0, max0, min1, max1;
			min0 = max0 = axis.dotProduct(plgpnt[0]);
			for (var a = 1; a < plglen; a++) {
				var t = axis.dotProduct(plgpnt[a]);
				if (t < min0) min0 = t;
				if (t > max0) max0 = t;
			}
			min1 = axis.dotProduct(new Vector({x:0, y:0}));
			max1 = min1 + circ.r;
			min1 -= circ.r;
			sOffset = axis.dotProduct(vOffset);
			min0 += sOffset;
			max0 += sOffset;
			var d0 = min0 - max1,
				d1 = min1 - max0;
			if (d0 > 0 || d1 > 0) {
				// gap found
				return null;
			}
			if (max0 < max1 || min0 > min1) result.shapeAContained = false;
			if (max1 < max0 || min1 > min0) result.shapeBContained = false;
			var distmin = d0,
				distminAbs = Math.abs(distmin);
			if (distminAbs < shortestDist) {
				// this distance is shorter so use it...
				result.distance = distmin;
				result.vector = axis;
				shortestDist = distminAbs;
			}
		}
		result.separation = result.vector.multiply(result.distance);
		return result;
	}
}
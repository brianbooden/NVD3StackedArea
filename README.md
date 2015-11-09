NVD3 Stream Chart
==========
The Stream Graph is a type of stacked area graph which is displaced around a central axis, resulting in a flowing, organic shape.

This extension takes the core implementation of a stacked area chart from NVD3 (http://nvd3.org/examples/stackedArea.html) and adapts it to be used in Qlik Sense.  Note that native Sense Selections are supported, but selections made from the NVD3 legend or chart area currently do NOT send the selections back to Sense.

My thanks to Ralf Becher who originally implemented this extension in QlikView and provided guidance in implementing it in Sense.

The extension exposes the following properties:  

Properties
==========

Chart Type - Stream (default), Stacked, or Expanded.
Colors and Legend - Sequential, Sequential (Reverse), Diverging RdYlBu, Diverging RdYlBu (Reverse), Blues, Reds, YlGnBu.
Show Legend - Shows or Hides the NVD3 Legend.
Show Controls - Hide or Show the ability to change between Stream, Stacked and Expanded from within the chart itself.
Interactive Guideline - Hide or Show a Guideline and highlighted points for each dimension 

An example (Demostream.qvf) is included.

Future improvements:
1. Selections from inside the NVD3 Chart or Legend do not filter back through to Sense.
2. Support for 10k points

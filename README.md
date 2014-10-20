White Board
==========

This is a collaborative tool built by HTML5 technology.

## The full source codes are moved to bitbucket: https://bitbucket.org/yejingfu/whiteboard

## Overview

This application is aiming to provide a collaborative white board so that the co-workers can communicate in different ways.

All attendees are able to sketch on the main white board simultaneously. Each peer's status can be synchronized by the server. Meanwhile the application provides video and audio communication.

The user interface is looking like below:

![ux](https://github.com/yejingfu/whiteboard/blob/master/doc/img/whiteboard_ux.png?raw=true)

## Setup

[Howto](https://github.com/yejingfu/whiteboard/blob/master/HOWTO.md)

If you fail to get source from home, please disconnec VPN!!!

## Sketch tool

The `paper.js` is used as the sketching engine. See more details [here](http://www.paperjs.org).

## Collaboration

The `share.js` is very powerful collaborative engine. It's used here to sychronize operations by all clients. See more details [here](http://www.sharejs.org).

## Video communication

The `WebRTC` is an open source technology used for real-time video based communiation. See more details [here](http://www.webrtc.org).

More details please reference to:

* [W3C draft](http://www.w3.org/TR/webrtc/)
* [WebRTC](http://www.webrtc.org)
* [examples in Chinese](http://blog.chinaunix.net/uid-24567872-id-3961702.html)

## Chat

The application will support real-time chatting by texting and audeo.

## Acknowledgment

More workmates will contribute to this project. Lots thanks to them.

/*****************************************************************
 ** Author: Asvin Goel, goel@telematique.eu
 **
 ** A plugin for broadcasting reveal.js presentations
 **
 ** Version: 0.1
 **
 ** License: MIT license (see LICENSE.md)
 **
 ** Credits:
 ** Reveal.js & multiplex plugin by Hakim El Hattab (https://github.com/hakimel/reveal.js)
 ** RTCMultiConnection by Muaz Khan (https://github.com/muaz-khan/RTCMultiConnection)
 ******************************************************************/

var RevealBroadcast =
  window.RevealBroadcast ||
  (function() {
    /*
	* Recursively merge properties of two objects 
	*/
    function mergeRecursive(obj1, obj2) {
      for (var p in obj2) {
        try {
          // Property in destination object set; update its value.
          if (obj1[p].constructor == Object && obj2[p].constructor == Object) {
            obj1[p] = mergeRecursive(obj1[p], obj2[p]);
          } else {
            obj1[p] = obj2[p];
          }
        } catch (e) {
          // Property in destination object not set; create it and set its value.
          obj1[p] = obj2[p];
        }
      }
      return obj1;
    }

    var path = scriptPath();
    function scriptPath() {
      // obtain plugin path from the script element
      var src;
      if (document.currentScript) {
        src = document.currentScript.src;
      } else {
        var sel = document.querySelector('script[src$="/chalkboard.js"]');
        if (sel) {
          src = sel.src;
        }
      }

      var path =
        typeof src === undefined ? src : src.slice(0, src.lastIndexOf("/") + 1);
      //console.log("Path: " + path);
      return path;
    }

    /*****************************************************************
     ** Initialisation
     ******************************************************************/
    var config = Reveal.getConfig().broadcast || {};

    var master = false;
    var broadcastId = window.location.pathname;
    if (config.broadcastId) broadcastId = config.broadcastId;
    if (config.master) master = config.master;
    var width = config.width || 640;
    var height = config.height || 480;
    var mediaPlayer = null;
    var defaults = {
      enableScalableBroadcast: true,
      maxRelayLimitPerUser: 2,
      useDefaultDevices: true, // do not force selection of specific devices
      autoCloseEntireSession: true,
      // by default, socket.io server is assumed to be deployed on your own URL
      // overwrite scoketURL, e.g. connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
      socketURL: "/",
      session: {
        audio: true,
        video: true,
        oneway: true
      },
      socketMessageEvent: "reveal.js-broadcast-demo",
      enableLogs: false
    };

    var connection = new RTCMultiConnection(window.location.pathname); // use URL as channel-id
    mergeRecursive(connection, defaults);
    if (config.connection) mergeRecursive(connection, config.connection);

	connection.socketCustomEvent = connection.channel;
	
	var cameraSelectionContainer = document.querySelector('#cameras-selection-container');
    var dontDuplicate = {};
    DetectRTC.load(function() {
      DetectRTC.videoInputDevices.forEach(function(camera) {
        if (dontDuplicate[camera.deviceId]) return;
        dontDuplicate[camera.deviceId] = true;

        if (!camera.label) camera.label = "Camera";

        navigator.mediaDevices
          .getUserMedia({ video: { deviceId: camera.deviceId } })
          .then(function(stream) {
            var video = document.createElement("video");
            video.onloadedmetadata = function() {
              video.removeAttribute("srcObject");
              video.removeAttribute("src");
              stream.getTracks().forEach(function(track) {
                track.stop();
              });

              var div = document.createElement("div");
              div.id = camera.deviceId;
              div.className = "camera";
              html = '<button class="button button--camera">' + camera.label.split("(")[0].trim() + '</button>';
              div.innerHTML = html;
              cameraSelectionContainer.appendChild(div);

              div.onclick = function() {
                if ((div.className || "").indexOf("camera-selected") !== -1)
                  return;

                querySelectorAll(".camera-selected").forEach(function(element) {
                  element.className = (element.className || "").replace(
                    /camera-selected/g,
                    ""
                  );
                });

                div.className += " camera-selected";

                connection.attachStreams.forEach(function(stream) {
                  stream.stop();
                });

                connection.mediaConstraints.video.optional = [
                  {
                    sourceId: div.id
                  }
                ];

                setTimeout(function() {
                  connection.addStream(connection.session);
                }, 300);
              };
            };
            video.srcObject = stream;
            video.play();
          });
      });
    });
	function querySelectorAll(selector, element) {
		element = element || document;
		return Array.prototype.slice.call(element.querySelectorAll(selector));
	}


    function prestart(params) {
      if (config.secret) {
        if (params) {
          checkpw(params.password, config.secret, function(verified) {
            if (verified) {
              start(params);
            } else {
              alert("Wrong password!");
            }
          });
        } else {
          alert("You are not allowed to start broadcast without password!");
        }
      } else {
        start(params);
      }
    }

    function start(params) {
      mediaPlayer = document.getElementById("broadcast-mediaplayer");
      if (params && params.id) broadcastId = params.id;

      // user need to connect server, so that others can reach him.
      connection.connectSocket(function(socket) {
        socket.on("logs", function(log) {
          console.log(log);
        });

        // this event is emitted when a broadcast is absent.
        socket.on("start-broadcasting", function(typeOfStreams) {
          console.log("start-broadcasting", typeOfStreams);

          // host i.e. sender should always use this!
          connection.sdpConstraints.mandatory = {
            OfferToReceiveVideo: false,
            OfferToReceiveAudio: false
          };
          connection.session = typeOfStreams;

          // "open" method here will capture media-stream
          // we can skip this function always; it is totally optional here.
          // we can use "connection.getUserMediaHandler" instead
          connection.open(connection.userid, function() {
            console.log("Connection opened: " + connection.sessionid);
          });
        });

        // establish connection
        socket.emit("check-broadcast-presence", broadcastId, function(
          isBroadcastExists
        ) {
          if (!isBroadcastExists) {
            // the first person (i.e. real-broadcaster) MUST set his user-id
            console.log("Start broadcast", broadcastId, isBroadcastExists);
            connection.userid = broadcastId;
            socket.emit("join-broadcast", {
              broadcastId: broadcastId,
              userid: connection.userid,
              typeOfStreams: connection.session
            });
          } else {
            alert("Broadcast already exists!");
          }

          function post(e) {
            socket.emit(connection.socketCustomEvent, {
              sender: connection.userid,
              state: Reveal.getState(),
              content: e.content || null
            });
          }

          // Monitor events that trigger a change in state
          Reveal.addEventListener("slidechanged", post);
          Reveal.addEventListener("fragmentshown", post);
          Reveal.addEventListener("fragmenthidden", post);
          Reveal.addEventListener("overviewhidden", post);
          Reveal.addEventListener("overviewshown", post);
          Reveal.addEventListener("paused", post);
          Reveal.addEventListener("resumed", post);
          document.addEventListener("send", post); // broadcast custom events sent by other plugins
        });
      });

      connection.onNumberOfBroadcastViewersUpdated = function(event) {
        if (!connection.isInitiator) return;
        console.log("Number of viewers: " + event.numberOfBroadcastViewers);
      };

      connection.onNewParticipant = function(participantId, userPreferences) {
        if (!connection.isInitiator) return;
        console.log(participantId + " joined");
        connection.acceptParticipationRequest(participantId, userPreferences);
        // Send current state so that new participant will move to the same slide
        connection.socket.emit(connection.socketCustomEvent, {
          sender: connection.userid,
          state: Reveal.getState()
        });
        // inform other plugins
        var event = new CustomEvent("newclient");
        event.content = { id: participantId, preferences: userPreferences };
        document.dispatchEvent(event);
      };
    }

    function connect(params) {
      mediaPlayer = document.getElementById("broadcast-mediaplayer");
      if (params && params.id) broadcastId = params.id;
      // user need to connect server, so that others can reach him.
      connection.connectSocket(function(socket) {
        // Receive custom event
        socket.on(connection.socketCustomEvent, function(message) {
          console.log("Received: " + JSON.stringify(message));
          if (message.state) {
            Reveal.setState(message.state);
          }
          if (message.content) {
            // forward custom events to other plugins
            var event = new CustomEvent("received");
            event.content = message.content;
            document.dispatchEvent(event);
          }
        });

        socket.on("logs", function(log) {
          console.log(log);
        });

        // this event is emitted when a broadcast is already created.
        socket.on("join-broadcaster", function(hintsToJoinBroadcast) {
          console.log("join-broadcaster", hintsToJoinBroadcast);

          connection.session = hintsToJoinBroadcast.typeOfStreams;
          connection.sdpConstraints.mandatory = {
            OfferToReceiveVideo: !!connection.session.video,
            OfferToReceiveAudio: !!connection.session.audio
          };
          connection.broadcastId = hintsToJoinBroadcast.broadcastId;
          connection.join(hintsToJoinBroadcast.userid);
        });

        socket.on("rejoin-broadcast", function(broadcastId) {
          console.log("rejoin-broadcast", broadcastId);

          connection.attachStreams = [];
          socket.emit("check-broadcast-presence", broadcastId, function(
            isBroadcastExists
          ) {
            if (isBroadcastExists) {
              socket.emit("join-broadcast", {
                broadcastId: broadcastId,
                userid: connection.userid,
                typeOfStreams: connection.session
              });
            }
          });
        });

        socket.on("broadcast-stopped", function(broadcastId) {
          console.error("broadcast-stopped", broadcastId);
          alert("This broadcast has been stopped.");
        });

        // establish connection
        socket.emit("check-broadcast-presence", broadcastId, function(
          isBroadcastExists
        ) {
          if (isBroadcastExists) {
            console.log("Join broadcast", broadcastId, isBroadcastExists);
            socket.emit("join-broadcast", {
              broadcastId: broadcastId,
              userid: connection.userid,
              typeOfStreams: connection.session
            });
          } else {
            alert("Broadcast does not yet exist!");
          }
        });
      });
    }
    /// End connect

    connection.onstream = function(event) {
      if (connection.isInitiator && event.type !== "local") {
        return;
      }

      if (event.mediaElement) {
        event.mediaElement.pause();
        delete event.mediaElement;
      }

      connection.isUpperUserLeft = false;
      mediaPlayer.src = URL.createObjectURL(event.stream);
      mediaPlayer.play();

      mediaPlayer.userid = event.userid;

      document.querySelector(".js-broadcast").classList.add("is-playing");

      if (event.type === "local") {
        mediaPlayer.muted = true;
      }

      if (connection.isInitiator == false && event.type === "remote") {
        // he is merely relaying the media
        connection.dontCaptureUserMedia = true;
        connection.attachStreams = [event.stream];
        connection.sdpConstraints.mandatory = {
          OfferToReceiveAudio: false,
          OfferToReceiveVideo: false
        };

        var socket = connection.getSocket();
        socket.emit("can-relay-broadcast");

        if (connection.DetectRTC.browser.name === "Chrome") {
          connection.getAllParticipants().forEach(function(p) {
            if (p + "" != event.userid + "") {
              var peer = connection.peers[p].peer;
              peer.getLocalStreams().forEach(function(localStream) {
                peer.removeStream(localStream);
              });
              peer.addStream(event.stream);
              connection.dontAttachStream = true;
              connection.renegotiate(p);
              connection.dontAttachStream = false;
            }
          });
        }

        if (connection.DetectRTC.browser.name === "Firefox") {
          // Firefox is NOT supporting removeStream method
          // that's why using alternative hack.
          // NOTE: Firefox seems unable to replace-tracks of the remote-media-stream
          // need to ask all deeper nodes to rejoin
          connection.getAllParticipants().forEach(function(p) {
            if (p + "" != event.userid + "") {
              connection.replaceTrack(event.stream, p);
            }
          });
        }
      }
    };
    function scriptPath() {
      // obtain plugin path from the script element
      var src;
      if (document.currentScript) {
        src = document.currentScript.src;
      } else {
        var sel = document.querySelector('script[src$="/chalkboard.js"]');
        if (sel) {
          src = sel.src;
        }
      }

      var path =
        typeof src === undefined ? src : src.slice(0, src.lastIndexOf("/") + 1);
      //console.log("Path: " + path);
      return path;
    }

    this.start = prestart;
    this.connect = connect;
    return this;
  })();

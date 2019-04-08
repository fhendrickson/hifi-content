//
//  whiteboardReset.js
//
//  created by Rebecca Stankus on 03/28/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var RESET_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/resetWhiteboard.mp3'));
    var RESET_SOUND_VOLUME = 0.05;
    var SEARCH_RADIUS_M = 6;

    var injector;

    var WhiteboardReset = function() {
        _this = this;
    };

    WhiteboardReset.prototype = {

        /* ON PRELOAD: Save a reference to this */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
        mode requested. */
        playSound: function(sound, volume, position, localOnly, loop){
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                    injector = null;
                }
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: volume,
                    localOnly: localOnly,
                    loop: loop
                });
            }
        },

        /* When clicked or triggered, find all nearby whiteboard lines and delete them */
        mousePressOnEntity: function( entityID, event ) {
            if (event.isLeftButton) {
                var position = Entities.getEntityProperties(_this.entityID, 'position').position;
                _this.playSound(RESET_SOUND, RESET_SOUND_VOLUME, MyAvatar.position, true, false);
                Entities.findEntitiesByName("Whiteboard Polyline", position, SEARCH_RADIUS_M).
                    forEach(function(whiteboardPiece) {
                        var name = Entities.getEntityProperties(whiteboardPiece, 'name').name;
                        if (name && name === "Whiteboard Polyline") {
                            Entities.deleteEntity(whiteboardPiece);
                        }
                    });
            }
        }
    };

    return new WhiteboardReset();
});

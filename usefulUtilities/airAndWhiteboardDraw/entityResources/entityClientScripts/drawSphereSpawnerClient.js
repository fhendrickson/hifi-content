//
//  drawSphereSpawnerClient.js
//
//  created by Rebecca Stankus on 03/28/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var RGB_MAX_VALUE = 255;
    var DECIMAL_PLACES = 2;

    var injector;
    var parentJointIndex;
    var dominantHandJoint;
    var dominantHand;

    var PaintSphereSpawner = function() {
        _this = this;
    };

    PaintSphereSpawner.prototype = {
        remotelyCallable: ['createPaintSphere'],
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

        /* Convert RGB value to 0-1 scale */
        rgbConversion: function(rgbColorValue) {
            return (rgbColorValue/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
        },
        
        /* Check for existing paint sphere and delete if found */
        removePaintSpheres: function() {
            MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
                var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
                if (name && (name === "Whiteboard Paint Sphere" || name === "Whiteboard Paint Sphere Material")) {
                    Entities.deleteEntity(avatarEntity.id);
                }
            });
        },

        /* */
        createPaintSphere: function() {
            dominantHand = MyAvatar.getDominantHand();
            dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
            parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index4");
            if (parentJointIndex === -1) {
                MyAvatar.getJointIndex(dominantHandJoint + "Index3");
            }
            if (parentJointIndex === -1) {
                MyAvatar.getJointIndex(dominantHandJoint);
                print("ERROR: Falling back to dominant hand joint as index finger tip could not be found");
            }
            var properties = Entities.getEntityProperties(_this.entityID, ['userData', 'color']);
            var userData = JSON.parse(properties.userData);
            var paintSphere = Entities.addEntity({
                name: "Whiteboard Paint Sphere",
                type: "Model",
                modelURL: Script.resolvePath("../resources/models/sphere-white-emissive.fbx"),
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: parentJointIndex,
                localPosition: { x: 0, y: 0, z: 0 },
                localRotation: Quat.fromVec3Degrees({x: 0, y: 0, z: 0 }),
                localDimensions: { x: 0.015, y: 0.015, z: 0.015 },
                script: Script.resolvePath("drawSphereClient.js?" + Date.now()),
                grab: { grabbable: false },
                collisionless: true,
                lifetime: 500,
                userData: JSON.stringify({textureURL: userData.textureURL})
            }, 'avatar');
            var colorRescaled = {};
            colorRescaled.red = _this.rgbConversion(properties.color.red);
            colorRescaled.green = _this.rgbConversion(properties.color.green);
            colorRescaled.blue = _this.rgbConversion(properties.color.blue);
            Entities.addEntity({
                type: "Material",
                name: "Whiteboard Paint Sphere Material",
                materialURL: "materialData",
                priority: 1,
                parentID: paintSphere,
                materialData: JSON.stringify({
                    materials: {
                        albedo: colorRescaled,
                        emissive: colorRescaled
                    }
                })
            }, 'avatar');
        },

        /* when clicked or triggered, calculate position of avatar's hand and create a paint sphere */
        mousePressOnEntity: function( entityID, event ) {
            print("EVENT: ", JSON.stringify(event));
            print("MOUSE PRESS");
            if (event.isLeftButton) {
                _this.removePaintSpheres();
                _this.createPaintSphere();
            }
        }
    };
    return new PaintSphereSpawner();
});

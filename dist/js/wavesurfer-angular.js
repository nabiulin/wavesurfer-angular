(function (angular, WaveSurfer) {
    'use strict';

    var module = angular.module('wavesurfer.angular', ['ui.slider']);

    module
        .directive('wavesurfer', wavesurferDirective)
        .filter('hms', hmsFilter);

    wavesurferDirective.$inject = ['$rootScope', '$timeout', '$templateCache', '$http', '$compile'];
    function wavesurferDirective($rootScope, $timeout, $templateCache, $http, $compile) {
        var uuid = 1;

        return {
            restrict: 'AE',
            scope: {
                url: '=',
                peaks: '=?',
                autoLoad: '=?',
                options: '=',
                customTemplateUrl: '@template'

            },
            templateUrl: '../dist/template/wavesurfer.html',
            link: function (scope, element) {
                var waveformContainer = element.find('div.audio')[0],
                    length = 0,
                    wavesurfer = undefined,
                    defaultOptions = {
                        hideScrollbar: true,
                        height: 50,
                        waveColor: "#337ab7",
                        normalize: true,
                        progressColor: "#23527c",
                        container: waveformContainer
                    };

                var options = angular.extend(defaultOptions, scope.options);

                waveformContainer.style.height = options.height + 'px';

                scope.isPlaying = false;
                scope.isLoading = false;
                scope.uniqueId = 'waveform_' + (uuid++);
                scope.isVolumeActive = false;
                scope.volume = 50;
                scope.progress = 0;
                scope.remaining = 0;
                scope.autoLoad = !!scope.autoLoad;
                scope.defaultWavePosition = options.height / 2;


                /**
                 * On ready
                 */
                var ready = function () {
                    length = Math.floor(wavesurfer.getDuration());

                    if (!scope.autoLoad) {
                        scope.$emit('wavesurfer:stop');
                    }

                    $timeout(function () {
                        scope.remaining = length;
                        scope.isLoading = false;
                        scope.playPause();
                    });
                };

                /**
                 * Update time during playing audio
                 * @param {Number} time
                 */
                var audioprocess = function (time) {
                    $timeout(function () {
                        scope.progress = time;
                        scope.remaining = length - time;
                    });
                };

                /**
                 * On finish
                 * Move cursor to start
                 */
                var finish = function () {
                    scope.isPlaying = false;
                    wavesurfer.seekTo(0);
                };

                /**
                 * Init WaveSurfer functionality
                 * @param {Array} peaks peak array
                 */
                var init = function (peaks) {
                    wavesurfer = WaveSurfer.create(options);
                    wavesurfer.load(scope.url, peaks || null);

                    wavesurfer.on('ready', ready);
                    wavesurfer.backend.on('audioprocess', audioprocess);
                    wavesurfer.on('finish', finish);

                    scope.$watch('volume', function (value) {
                        if (value) {
                            wavesurfer.setVolume(value / 100);
                        }
                    });
                };

                /**
                 * Load audio record
                 */
                scope.load = function () {
                    if (!angular.isDefined(wavesurfer)) {
                        scope.isLoading = true;
                        init(scope.peaks);
                    } else {
                        if (!wavesurfer.isPlaying()) {
                            scope.$emit('wavesurfer:stop');
                        }
                        scope.playPause();
                    }
                };

                //is autoLoad param is passed
                //load audio file automatically
                if (scope.autoLoad) {
                    scope.load();
                }

                /**
                 * Pause
                 */
                scope.pause = function () {
                    wavesurfer.pause();
                    scope.isPlaying = false;
                };

                /**
                 * Play or pause
                 */
                scope.playPause = function () {
                    scope.isPlaying = !scope.isPlaying;
                    scope.isVolumeActive = false;
                    wavesurfer.playPause();
                };

                /**
                 * Stop
                 */
                scope.stop = function () {
                    wavesurfer.stop();
                    scope.isPlaying = false;
                };

                /**
                 * Forward
                 */
                scope.forward = function () {
                    wavesurfer.skipForward();
                };

                /**
                 * Backward
                 */
                scope.backward = function () {
                  wavesurfer.backward();
                };

                /**
                 * Check if WaveSurfer is loaded
                 * @returns {Boolean}
                 */
                scope.isWavesurferLoaded = function () {
                    return angular.isDefined(wavesurfer);
                };

                var customTemplate = scope.customTemplateUrl;
                if (customTemplate) {
                    element.html($templateCache.get(customTemplate));
                    $compile(element.contents())(scope);
                }

                /**
                 * Subscribe on wavesurfer:stop event
                 * and stop other wavesurfers
                 */
                $rootScope.$on('wavesurfer:stop', function () {
                    if (angular.isDefined(wavesurfer) && wavesurfer.isPlaying()) {
                        scope.stop();
                    }
                });
            }
        };
    }

    hmsFilter.$inject = [];
    function hmsFilter() {
        return function (str) {
            var duration = parseInt(str, 10),
                hours = Math.floor(duration / 3600),
                minutes = Math.floor((duration - (hours * 3600)) / 60),
                seconds = duration - (hours * 3600) - (minutes * 60);

            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            return hours + ':' + minutes + ':' + seconds;
        };
    }

}(window.angular, window.WaveSurfer));

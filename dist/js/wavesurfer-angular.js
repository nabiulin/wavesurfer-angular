(function (angular, WaveSurfer) {
    'use strict';

    var module = angular.module('wavesurfer.angular', ['ui.slider']);

    function wavesurferDirective($rootScope, $timeout) {
        var uuid = 1;

        return {
            restrict: 'AE',
            scope: {
                url: '=',
                peaks: '=?',
                options: '='
            },
            templateUrl: '../dist/template/wavesurfer.html',
            link: function (scope, element) {
                var waveformContainer = element.find('div.audio')[0],
                    length = 0,
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

                scope.isVolumeActive = false;
                scope.volumeLevel = 50;
                scope.isPlaying = false;
                scope.isLoading = false;
                scope.uniqueId = 'waveform_' + (uuid++);
                scope.progress = 0;
                scope.remaining = 0;

                var ready = function () {
                    length = Math.floor(scope.wavesurfer.getDuration());

                    scope.$emit('wavesurfer:stopAll');

                    $timeout(function () {
                        scope.remaining = length;
                        scope.isLoading = false;
                        scope.playPause();
                    });
                };

                var audioprocess = function (time) {
                    $timeout(function () {
                        scope.progress = time;
                        scope.remaining = length - time;
                    });
                };

                var finish = function () {
                    scope.isPlaying = false;
                    scope.wavesurfer.seekTo(0);
                };

                var init = function (peaks) {
                    scope.wavesurfer = WaveSurfer.create(options);
                    scope.wavesurfer.load(scope.url, peaks || null);

                    scope.wavesurfer.on('ready', ready);
                    scope.wavesurfer.backend.on('audioprocess', audioprocess);
                    scope.wavesurfer.on('finish', finish);

                    scope.$watch('volume', function (value) {
                        if (value) {
                            scope.wavesurfer.setVolume(value / 100);
                        }
                    });
                };

                scope.load = function () {
                    if (!angular.isDefined(scope.wavesurfer)) {
                        scope.isLoading = true;
                        init(scope.peaks);
                    } else {
                        if (!scope.wavesurfer.isPlaying()) {
                            scope.$emit('wavesurfer:stopAll');
                        }
                        scope.playPause();
                    }
                };

                scope.playPause = function () {
                    scope.isPlaying = !scope.isPlaying;
                    scope.isVolumeActive = false;
                    scope.wavesurfer.playPause();
                };

                scope.pause = function () {
                    scope.wavesurfer.pause();
                    scope.isPlaying = false;
                };

                scope.stop = function () {
                    scope.wavesurfer.stop();
                    scope.isPlaying = false;
                };

                $rootScope.$on('wavesurfer:stopAll', function () {
                    if (angular.isDefined(scope.wavesurfer)) {
                        scope.stop();
                    }
                });
            }
        };
    }

    function hmsFilter() {
        return function (str) {
            var secNum = parseInt(str, 10),
                hours = Math.floor(secNum / 3600),
                minutes = Math.floor((secNum - (hours * 3600)) / 60),
                seconds = secNum - (hours * 3600) - (minutes * 60);

            if (hours < 10) {
                hours = '0' + hours;
            }
            if (minutes < 10) {
                minutes = '0' + minutes;
            }
            if (seconds < 10) {
                seconds = '0' + seconds;
            }

            return minutes + ':' + seconds;
        };
    }

    module
        .directive('wavesurfer', wavesurferDirective)
        .filter('hms', hmsFilter);

}(window.angular, window.WaveSurfer));

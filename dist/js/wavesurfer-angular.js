(function (angular, WaveSurfer) {
    'use strict';

    var module = angular.module('wavesurfer.angular', ['ui.slider']);

    module
        .directive('wavesurfer', wavesurferDirective)
        .filter('hms', hmsFilter);

    wavesurferDirective.$inject = ['$rootScope', '$timeout'];
    function wavesurferDirective($rootScope, $timeout) {
        var uuid = 1;

        return {
            restrict: 'AE',
            scope: {
                url: '=',
                peaks: '=?',
                autoLoad: '=?',
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
                scope.defaultWavePosition = options.height / 2;
                scope.autoLoad = !!scope.autoLoad;

                var ready = function () {
                    length = Math.floor(scope.wavesurfer.getDuration());

                    if (!scope.autoLoad) {
                        scope.$emit('wavesurfer:stop');
                    }

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
                            scope.$emit('wavesurfer:stop');
                        }
                        scope.playPause();
                    }
                };

                if (scope.autoLoad) {
                    scope.load();
                }

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

                scope.isWavesurferLoaded = function () {
                    return angular.isDefined(scope.wavesurfer);
                };

                $rootScope.$on('wavesurfer:stop', function () {
                    if (angular.isDefined(scope.wavesurfer) && scope.wavesurfer.isPlaying()) {
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

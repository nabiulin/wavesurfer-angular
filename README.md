# Wavesurfer Angular

AngularJS directive wraps the [wavesurfer.js](http://wavesurfer-js.org/) plugin to be more flexible to use in AngularJS apps.<br>
Forked from [wavesurfer-angular] (https://github.com/karimfikry/wavesurfer-angular) and built without bootstrap dependency.

#Installation
```bash
npm install -g bower
bower install
```

# Beta release.

#### Directive params

* `url` - Audio URL
* `peaks` - Peak array. In some situations you may need to generate peak array in your application
* `options` - Additional options could be found on [wavesurfer.js] (https://github.com/katspaugh/wavesurfer.js/blob/master/README.md#wavesurfer-options)
* `auto-load` - false by default. Sometimes you might need to add more than one waveform.
It causes perfomance issues because of async audio data loading. That is why this option is false by default.
In case on one form per page, pass true and your waveform will be loaded automatically
* `template` - Custom template url

License
----

MIT
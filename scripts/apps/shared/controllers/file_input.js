/*globals File */

/**
 * Re-usable code for a file input with drag 'n drop support. Takes
 * a file input as an argument and upgrades it to a drag 'n drop target
 * in browsers that support the necessary features.  Goes well with
 * jive.FileUploader.
 *
 * Emits a 'change' event when a file is selected, or when the file
 * input is reset.  The change event includes a list of files as an
 * event parameter.  The files are instances of File[1] in browsers that
 * support that object type, and are file input elements otherwise.
 *
 * [1]: https://developer.mozilla.org/en/DOM/File
 *
 * @depends template=jive.shared.file.dropTarget
 * @depends template=jive.shared.file.filledDropTarget
 */
define('jive.FileInput', ['jquery'], function($) {
    return jive.AbstractView.extend(function(protect) {

        protect.init = function(fileInput, options) {
            var $input = $(fileInput)
              , files = options ? options.files : [];
            this.content = $input;

            this.fieldName = $input.prop('name');
            this.required = $input.prop('required');

            if (typeof FormData !== 'undefined' && typeof File !== 'undefined' && this.draganddrop()) {
                this.content = $('<div></div>');
                $input.after(this.content);
                this.hideInput($input);

                if (files && files.length > 0) {
                    this.select(files);
                } else {
                    this.reset();
                }

                this.preventDefaultDropBehavior();
                this._dragAndDrop = true;
            } else {
                this.addInputEvents($input);
                this._dragAndDrop = false;
            }
        };

        this.dragAndDrop = function(){
            return this._dragAndDrop;
        };

        this.reset = function() {
            if ((typeof this.dragAndDrop() === "undefined") || this.dragAndDrop()) {
                var $target = $(jive.shared.file.dropTarget())
                    , view = this;

                this.replaceWith($target);
                this.content = $target;

                this.addDropEvents($target);

                $target.on('click', function (event) {
                    event.preventDefault();
                    view.fileBrowser();
                });
            }

            if (this.$input) {
                this.$input.prop('required', this.required);
                this.clearInput();
            }
        };

        protect.select = function(files) {
            var file = files[0]
              , fileName = file.name
              , extension = fileName.split('.').slice(1).join('.').toLowerCase()
              , view = this;

            var $target = $(jive.shared.file.filledDropTarget($.extend({
                fileName: fileName,
                extension: extension
            }, file, {
                size: file.formattedSize || file.size
            })));

            if (file instanceof File) {
                $target.data('name', this.fieldName);
                $target.data('value', file);
            }
            this.clearInput();

            this.replaceWith($target);
            this.content = $target;

            this.addDropEvents($target);

            $target.on('click', function(event) {
                event.preventDefault();
                view.reset();
                view.emitChange([]);
            });

            // Do not flag hidden file input for validation error
            // because we have a file via the drop target.
            this.$input.prop('required', false);

            this.emitChange(files);
        };

        protect.fileBrowser = function() {
            this.$input.trigger('click');
        };

        protect.addDropEvents = function($target) {
            var view = this;

            $target
            .on('dragenter', function(event) {
                // IE10 requires a preventDefault() call here to make
                // $target a drop target.
                // http://blogs.msdn.com/b/ie/archive/2011/07/27/html5-drag-and-drop-in-ie10-ppb2.aspx
                event.preventDefault();
            })
            .on('dragleave', function() {
                $(this).removeClass('j-drag-over');
            })
            .on('dragover', function(event) {
                // Allows dragged elements to be dropped here.  Not all
                // browsers require stopPropagation() to be called; but
                // apparently some do.
                // http://www.html5rocks.com/en/tutorials/dnd/basics/
                event.preventDefault();
                event.stopPropagation();

                // Setting a class on 'dragover' seems to be more
                // reliable than using the 'dragenter' event.
                $(this).addClass('j-drag-over');
                event.originalEvent.dataTransfer.dropEffect = 'copy';
            })
            .on('drop', function(event) {
                event.preventDefault();

                var files = event.originalEvent.dataTransfer.files;

                if (files.length >= 1) {
                    view.select(files);
                }
            });
        };

        // Removes the file input from view, but leaves it in the DOM
        // and technically visible so that triggering a 'click' event
        // on it opens the file chooser.
        protect.hideInput = function($input) {
            var view = this;
            this.$input = $input;

            $input.css({
                width: 0,
                height: 0,
                opacity: 0,
                position: 'absolute',
                'z-index': -1000
            });

            $input.on('change', function(event) {
                if (this.files && this.files.length > 0) {
                    view.select(this.files);
                }
            });
        };

        // Clear out file input - if the form is submitted we do not
        // want it to submit with a file that the user thought had been
        // cleared.  We also don't want the hidden file input to hold
        // one file while the drop target holds another.
        protect.clearInput = function() {
            var $input = this.$input
              , $newInput = $input.clone(true);

            // Firefox copies over the selected file when a file input
            // is cloned.  Get rid of it.
            $newInput.val('');

            $input.replaceWith($newInput);
            this.$input = $newInput;
        };

        // Prevent the page location from changing to a dropped file
        // when a file is dropped anywhere on the page.  This should
        // help to prevent confusion when a user tries to drop
        // a file on an element that is not actually a file drop
        // target.
        protect.preventDefaultDropBehavior = function() {
            $(document)
            .on('dragover', function(event) {
                var onFileInput = event.target && event.target.type === 'file';

                if (!onFileInput) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            })
            .on('drop', function(event) {
                var dt = event.originalEvent.dataTransfer
                  , files = dt && dt.files && dt.files.length > 0
                  , onFileInput = event.target && event.target.type === 'file';

                if (files && !onFileInput) {
                  event.preventDefault();
                }
            });
        };

        // Fallback behavior for browsers that do not support drag 'n
        // drop.
        protect.addInputEvents = function($input) {
            var view = this;
            $input.on('change', function() {
                view.emitChange(this);
            });
        };

        protect.emitChange = function(files) {
            this.emit('change', files);
        };

        // From Modernizer
        protect.draganddrop = function() {
            var div = document.createElement('div');
            return ('draggable' in div) || ('ondragstart' in div && 'ondrop' in div);
        };
    });
});

tinymce.PluginManager.add('subscribers', function(editor, url) {
    // Add a button that opens a window
    editor.ui.registry.addButton('subscribersElementButton', {
        text: 'Subscribers Text', 
        onAction: function() {
            editor.insertContent('<p class="subscribersText">INSERT TEXT ONLY FOR SUBSCRIBERS</p>');
        }
    });

    return {
        getMetadata: function () {
            return {
                name: 'Custom plugin',
                url: 'https://example.com/docs/customplugin'
            }; 
        }
    }
});
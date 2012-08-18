    define([
  // Application.
  "app"
],

// Map dependencies from above array.
function(app) {

  // Create a new module.
  var Src = app.module();

  // File model
  Src.File = Backbone.Model.extend({
    defaults: {
      path: null,
      pathBase: null,
      active: false,
      moduleName: null
    }
  });

  Src.FileList = Backbone.Collection.extend({
    model: Src.File
  });
  
  // A Module is a collection of Files
  Src.Module = Backbone.Model.extend({
    defaults: {
      name: 'Module',
      files: new Src.FileList()
    },

    initialize: function(){
      var files = this.get('files');
      if (_.isArray(files)){
        this.set('files', new Src.FileList(files));
      }
    }
  });
  
  Src.ModuleList = Backbone.Collection.extend({
    model: Src.Module,
    name: 'Modules',
    url: '/api/modules'
  });

  Src.Views.Module = Backbone.View.extend({

    tagName: 'ul',
    template: 'docco/module',
    className: 'nav nav-list',

    initialize: function(){
      this.model.on('change', this.render, this);

    },

    render: function(manage){
      this.model.get('files').each(function(file){
        this.insertView(new Src.Views.File({
          model: file
        }));
      }, this);

      return manage(this).render({ name: this.model.get('name') });
    }
  });

  Src.Views.File = Backbone.View.extend({

    tagName: 'li',
    template: 'docco/file',

    events: {
      'click a': 'activate'
    },

    serialize: function() {
      return { model: this.model };
    },

    initialize: function(){
      _.bindAll(this, 'activationChange');
      $.subscribe('activate', this.activationChange);
    },

    activate: function(){
      $.publish('activate', this.model);
    },

    activationChange: function(e, model){
      var thisIsActive = this.model.get('active'),
          isThis = this.model === model;
      if (!isThis && thisIsActive){
        this.$el.removeClass('active');
        this.model.set('active', false);
      }
      else if (isThis && !thisIsActive) {
        this.$el.addClass('active');
        this.model.set('active', true);
      }
    }
  }); 

  Src.Views.ModuleList = Backbone.View.extend({

    tagName: 'div',

    initialize: function(){
      this.collection.on('reset', this.render, this);
    },

    render: function(manage){
      this.collection.each(function(module){
        this.insertView(new Src.Views.Module({
          model: module
        }))
      }, this);

      return manage(this).render();
    }

  });

  Src.Views.Content = Backbone.View.extend({

    className: 'fileContent',

    initialize: function(){
      _.bindAll(this, 'activation');  
      $.subscribe('activate', this.activation);
    },

    activation: function(e, model){
      var path = model.get('path'),
          moduleName = model.get('moduleName');

      this.model = model;
      this.template = 'doccoOutput/' + moduleName +
        path.substring(0, path.indexOf('.js')).replace(/\//g, '_');
    
      this.render();
    }
  });

  Src.Views.ContentHeader = Backbone.View.extend({

    template: 'docco/contentheader',

    initialize: function(){
      _.bindAll(this, 'activation');  
      $.subscribe('activate', this.activation);
    },

    serialize: function() {
      return { model: this.model };
    },

    activation: function(e, model){
      this.model = model;    
      this.render();
    }
  })

  // Return the module for AMD compliance.
  return Src;

});

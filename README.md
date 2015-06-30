# grunt-plugins

## grunt-ejs-precompile
This grunt plugin is used to compile ejs template to javascript file with CMD module;

### example
```html
<h1><%= title%></h1>
```
to
```javascript
define('id', ['deps'], function(require, exports, module){
	module.exports = {
		tmpl1: function(data){
			var rst = [];
			rst.push('<h1>');
			rst.push(title);
			rst.push('</h1>');
			return rst.join('');
		}
	};
});
```

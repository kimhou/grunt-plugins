
'use strict'

exports.init = function (grunt) {

    var exports = {};
    /**
     * @description 压缩方法
     * @param {Array} files 文件列表
     * @param {String} moduleName 模块ID
     * @param {Array} 模块依赖
     */
    exports.compile = function (files, moduleName, deps) {
        var code = [];
        files.forEach(function (file) {
            code.push('"' + file.name + '": ' + codeToFunction(grunt.file.read(file.path, {encoding:'utf8'})));
        });
        if(code.length > 0){
            code = code.join(',');
            return 'define(' + (moduleName ? '"' + moduleName + '", ' : '')  + (deps && deps.length ? JSON.stringify(deps) + ', ' : '') + 'function (require, exports, module) {\n' +
                'var ' +
                "__a={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'},\n" +
                '__b=/[&<>"\']/g,\n' +
                '__e=function (s) {s = String(s);return s.replace(__b, function (m) {return __a[m]});},\n\n' +
                'tpls = module.exports = {\n' +
                code +
                '}' +
                '});';
        }
    }
    return exports;
}

function parseFiles(files) {

    var tpls = files.map(function (f) {
        var name = f.name.replace(/\.[^/.]+$/, ''),
            code = f.code,
            fn = codeToFunction(code);

        return '"' + name + '": ' + fn.toString();
    }).join(',\n');

    return 'define(function (require, exports, module) {\n' +
        'var ' +
        "__a={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'},\n" +
        '__b=/[&<>"\']/g,\n' +
        '__e=function (s) {s = String(s);return s.replace(__b, function (m) {return __a[m]});},\n\n' +
        'tpls = module.exports = {\n' +
        tpls +
        '}' +
        '});';
}

function codeToFunction(code) {

    if (!code) {
        return "function(){return ''}";
    }
    code = code.replace(/\/\/[^%]*/gmi, '');
    var regCode = /(?:(?:\r\n|\r|\n)\s*?)?<%([\-=]?)([\w\W\r\n]*?)%>(?:\r\n|\r|\n)?/gmi,
        index = 0,
        exec,
        len,
        res = ['var __p=[],_p=function(s){__p.push(s)};\n'],
        jscode,
        eq;
    while (exec = regCode.exec(code)) {

        len = exec[0].length;

        if (index !== exec.index) {
            res.push(";_p('");
            res.push(
                code
                    .slice(index, exec.index)
                    .replace(/\\/gmi, "\\\\")
                    .replace(/'/gmi, "\\'")
                    .replace(/\r\n|\r|\n/g, "\\r\\n\\\r\n")
            );
            res.push("');\r\n");
        }

        index = exec.index + len;

        eq = exec[1];
        jscode = exec[2];

        // escape html
        if (eq === '=') {
            res.push(';_p(__e(');
            res.push(jscode);
            res.push('));\r\n');
        }
        // no escape
        else if (eq === '-') {
            res.push(';_p(');
            res.push(jscode);
            res.push(');\r\n');
        } else {
            res.push(jscode);
        }
    }

    res.push(";_p('");
    res.push(
        code
            .slice(index)
            .replace(/\\/gmi, "\\\\")
            .replace(/'/gmi, "\\'")
            .replace(/\r\n|\r|\n/g, "\\r\\n\\\r\n")
    );
    res.push("');", '\r\n\r\n', 'return __p.join("");\r\n}', ',\r\n\r\n');
    res.length--;

    return ['function (data) {\r\n', res.join('')].join('');
}

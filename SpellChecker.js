/************************************************************************
 * jQuery плагин для проверки орфографии SpellChecker v.3.1             *
 *                                                                      *
 * В новой версии модуля используется jQuery                            *
 * Подключение осуществляется по принципу: $({selector}).spellCheck()   *
 *                                                                      *
 * Автор: Сергей Медведев (s.medvedev@newcontact.su)                    *
 *                                                                      *
 * Я позвоню тебе, когда понадобишься.                                  *
 *                   - Марк Цукерберг.                                  *
 ************************************************************************/

;
(function (defaults, $, window, document, undefined) {
    'use strict';
    $.extend({
        /****************************************************************
         * Временный словарь, представляющий собой объект,              *
         * в котором ключом является проверяемое слово,                 *
         * а значение может быть одного из двух типов:                  *
         *      bool(true) - правильное слово                           *
         *      array[]    - массив альтернатив для неправильного слова *
         ****************************************************************/
        dictionary: {},
        mousePosX: 0,
        mousePosY: 0,
        /*********************************************
         * Функция для исправления ошибок            *
         *                                           *
         * error — неправильное слово,               *
         * word — правильное слово,                  *
         * uid — уничкальный идентификатор объекста, *
         * index — позиция неправильного слова.      *
         *********************************************/
        fix_errors: function (error, word, uid, index) {
            var obj = $("[data-uid='" + uid + "']"),
                str = obj.val(),
                before = str.substr(0, index),
                after = str.substr(index),
                clone = $("#cl_" + uid);


            after = after.replace(error, word);
            str = before + after;
            obj.val(str);
            obj.focus();

            var scrollLeft = obj.get(0).scrollLeft,
                scrollTop = obj.get(0).scrollTop;

            obj.spellCheck().wrap(uid);
            $.spellResize();

            obj.get(0).scrollLeft = scrollLeft;

            console.log(obj.get(0).scrollLeft);
            // console.log(obj.get(0).scrollTop);

            clone.get(0).scrollLeft = obj.get(0).scrollLeft;
            clone.get(0).scrollTop = obj.get(0).scrollTop;


            $('#spellCheckContextMenu').detach();
        },
        /************************************************************************************************
         *  Функция, срабатывающая при изменении размеров окна или элемента:                            *
         *  изменяет позицию, размеры и прокрутку всех элементов с установленным атрибутом spellchecker *
         ************************************************************************************************/
        spellResize: function () {
            var objArr = $("[spellchecker]");
            for (var i = 0; i <= objArr.length; i++) {
                if (typeof objArr[i] !== "undefined") {
                    var uid = objArr[i].getAttribute("data-uid"),
                        wrapper = $("#wr_" + uid),
                        clone = $("#cl_" + uid),
                        obj = $("[data-uid='" + uid + "']"),
                        wr_width = obj.get(0).offsetWidth,
                        wr_height = obj.get(0).offsetHeight,
                        cl_width = obj.get(0).clientLeft + obj.get(0).clientWidth,
                        cl_height = obj.get(0).clientTop + obj.get(0).clientHeight,
                        cl_left = parseInt(obj.css('border-width')) + parseInt(obj.css('padding-left')),
                        cl_top = parseInt(obj.css('border-width')) + parseInt(obj.css('padding-top')),
                        parentPosition = obj.parent().css("position");

                    wrapper.css({
                        "width": function () {
                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && obj[0]['nodeName'] === 'TEXTAREA') {
                                wr_width -= 2;
                            }
                            return wr_width + "px";
                        },
                        "height": function () {
                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1 && obj[0]['nodeName'] === 'TEXTAREA') {
                                wr_height -= 2;
                            }
                            return wr_height + "px";
                        },
                        "left": function () {
                            if (obj.parent().css("position") === "absolute" || obj.parent().css("position") === "fixed") {
                                return obj.offset().left - obj.parent().offset().left;
                            } else {
                                return obj.offset().left;
                            }
                        },
                        "top": function () {
                            if (obj.parent().css("position") === "absolute" || obj.parent().css("position") === "fixed") {
                                return obj.offset().top - obj.parent().offset().top;
                            } else {
                                return obj.offset().top;
                            }
                        }
                    });

                    clone.css({
                        "width": function () {
                            return cl_width - cl_left + "px";
                        },
                        "height": function () {
                            return cl_height - cl_top + "px";
                        },
                        "left": function () {
                            return cl_left + "px";
                        },
                        "top": function () {
                            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                                return parseInt(obj.css('border-width')) + parseInt(obj.css('padding-top')) + 2 + "px";
                            } else {
                                return parseInt(obj.css('border-width')) + parseInt(obj.css('padding-top')) + "px";
                            }

                        }
                    });
                }
            }
        },
        spellcheckerSettings: function (options) {
            return $.extend(defaults, options);
        }
    }).fn.extend({
        spellCheck: function (options) {
            options = $.extend({}, defaults, options);
            return $(this).each(function () {
                if (typeof $(this).data("spellchecker") === "undefined") {
                    var text = $(this).val(),
                        uid = (typeof $(this).data("uid") === "undefined") ? $(this).uniqueID(5) : $(this).attr("data-uid");

                    $(this).attr("data-uid", uid);
                    $(this).attr("spellcheck", false);
                    $(this).attr("spellchecker", true);
                    $(this).attr('oncontextmenu', 'return false');

                    $(this).createWrapper(uid);

                    if (text.length > 0 && defaults[defaults['lang']]['chars'].test(text)) {
                        $(this).wrap(uid);
                    }

                    /***************
                     *    INPUT    *
                     ***************/
                    if ($(this)[0]['nodeName'] === 'INPUT') {

                        $(this).on('blur', function (e) {
                            var uid = $(this).attr("data-uid"),
                                obj = document.getElementById("cl_" + uid);
                            obj.scrollLeft = 0;
                            $(this).get(0).scrollLeft = 0;
                        });

                        $(this).on('scroll', function (e) {
                            setTimeout(function () {
                                $(this).scrollLeft(e);
                            }, 10);
                        });

                        $(this).on('change', function (e) {
                            setTimeout(function () {
                                $(this).scrollLeft(e);
                            }, 10);
                        });

                        $(this).on('keydown', function (e) {
                            setTimeout(function () {
                                $(this).scrollLeft(e);
                            }, 10);
                        });

                        $(this).on("keyup", function (e) {
                            var text = $(this).val(),
                                lastChar = text[text.length - 1],
                                uid = $(this).attr("data-uid");

                            if (defaults[defaults["lang"]]['word'].test(lastChar) === false) {
                                clearTimeout(defaults["timer"]);
                                $(this).wrap(uid);
                            } else {
                                $("#cl_" + uid).html($(this).val());
                                clearTimeout(defaults["timer"]);
                                defaults["timer"] = setTimeout(function () {
                                    $(this).wrap(uid);
                                }, 1000);
                            }

                            setTimeout(function () {
                                $(this).scrollLeft(e);
                            }, 10);

                        });
                        /******************
                         *    TEXTAREA    *
                         ******************/
                    } else if ($(this)[0]['nodeName'] === 'TEXTAREA') {

                        $(this).on('scroll', function (e) {
                            $(this).scrollTop(e);
                        });

                        $(this).on('keydown', function (e) {
                            $.spellResize();
                            $(this).scrollTop(e);
                        });
                        /*
                         * Ввод осуществлен и клавиша отпущена.
                         * Считать последний введённый символ:
                         * если это буква:
                         *  добавить текст на подложку, чтобы смещение было корректным
                         *  установить таймер в 1 секунду,
                         *    если по прошествии этого времени нажатий на клавишу не происходило,
                         *    выполнить орфографическую проверку текста
                         * если это не буква, сбросить таймер и выполнить орфографическую проверку
                         */
                        $(this).on("keyup", function (e) {
                            var text = $(this).val(),
                                lastChar = text[text.length - 1],
                                uid = $(this).attr("data-uid");

                            if (defaults[defaults["lang"]]['word'].test(lastChar) === false) {
                                clearTimeout(defaults["timer"]);
                                $(this).wrap(uid);
                            } else {
                                $("#cl_" + uid).html($(this).val());
                                clearTimeout(defaults["timer"]);
                                defaults["timer"] = setTimeout(function () {
                                    $(this).wrap(uid);
                                }, 1000);
                            }

                            $(this).scrollTop(e);
                        });
                    }

                    $(this).on("contextmenu", function () {
                        $(this).menu(uid);
                    });

                    $(this).wrap(uid);
                }
            });

        },
        scrollTop: function (e) {
            var uid = e.currentTarget.dataset.uid,
                scrollTop = e.currentTarget.scrollTop,
                obj = document.getElementById("cl_" + uid);
            obj.scrollTop = scrollTop;
        },
        scrollLeft: function (e) {
            var uid = e.currentTarget.dataset.uid,
                scrollLeft = e.currentTarget.scrollLeft,
                obj = document.getElementById("cl_" + uid);
            obj.scrollLeft = scrollLeft;
        },
        showProp: function () {
            return defaults;
        },
        /****************************************
         *  Обертка для скрытия полос прокрутки *
         *  на дублирующем слое                 *
         ****************************************/
        createWrapper: function (uid) {
            var wrapper = $('<div>'),
                clone = $('<div>'),
                obj = $(this),
                zIndex = obj.css("z-index"),
                position = obj.css("position");

            wrapper.attr("id", "wr_" + uid);

            wrapper.css({
                "display": "block",
                "position": "absolute",
                "overflow": "hidden",
                "color": 'rgba(255,0,0,0)',
                "font-family": obj.css('font-family'),
                "font-size": obj.css('font-size'),
                "letter-spacing": obj.css('letter-spacing'),
                "background-color": function () {
                    var background = obj.css("background-color");
                    obj.css("background", "none");
                    return background;
                },
                "z-index": function () {
                    if (position === "static") {
                        obj.css("position", "relative");
                        zIndex = obj.css("z-index");
                    }
                    if (zIndex < 1 || zIndex === "auto") {
                        zIndex = 1;
                        obj.css("z-index", zIndex);
                    }
                    return zIndex - 1;
                },
            });

            if (obj.parent().css("position") === "absolute" || obj.parent().css("position") === "fixed") {
                obj.parent().append(wrapper);
            } else {
                $("body").append(wrapper);
            }

            clone.attr("id", "cl_" + uid);
            clone.css({
                "display": "block",
                "position": "absolute",
                "overflow": "hidden",
                "color": 'rgba(255,0,0,0)',
                "background": "rgba(255,0,0,0)",
                "white-space": function () {
                    if (obj[0]['nodeName'] === 'INPUT') {
                        return "nowrap";
                    } else if (obj[0]['nodeName'] === 'TEXTAREA') {
                        return "pre-wrap";
                    }
                },
                "break-word": function () {
                    if (obj[0]['nodeName'] === 'TEXTAREA') {
                        return "break-word";
                    } else {
                        return "normal";
                    }
                }
            });
            wrapper.append(clone);
            $.spellResize();
        },
        /********************
         * Контекстное меню *
         ********************/
        menu: function (uid) {
            var text = $(this).val(),
                space = /\s/g,
                result = '',
                indexLast = '',
                menu = $('<div>');

            $('#spellCheckContextMenu').detach();

            menu.attr("id", "spellCheckContextMenu");
            menu.css({
                "id": "spellCheckContextMenu",
                "position": "absolute",
                "display": "block",
                "z-index": $(this).css("z-index") + 1,
                "top": $.mousePosY,
                "left": $.mousePosX,
            });
            $("body").append(menu);

            space.lastIndex = $(this).getCursorPosition();

            if (result = space.exec(text)) {
                text = text.substr(0, result.index);
            }
            indexLast = space.lastIndex = 0;
            while (result = space.exec(text)) {
                indexLast = result.index;
            }

            indexLast = (indexLast === 0) ? indexLast : indexLast + 1;
            text = text.substr(indexLast, text.length);


            text = text.replace(/[^а-яА-ЯёЁ]*/g, ''); // удалить знаки препинания

            var html = '<div class="spellMenu">';
            if (text in $.dictionary) {
                if ($.dictionary[text].length !== 0) {
                    for (var i = 0; i < $.dictionary[text].length; i++) {
                        html += '<span class="spellErr" onClick="$.fix_errors(\'' + text + '\',\'' + $.dictionary[text][i] + '\',\'' + uid + '\',\'' + (indexLast) + '\');">' + $.dictionary[text][i] + '</span>';
                    }
                }
            } else {
                html += '<span class="spellErr" onClick="focusTo(\'' + uid + '\')">Нет вариантов</span>';
            }
            html += '</div>';
            menu.html(html);
        },
        /*********************************************************
         *  Функция, создающая подчеркивание для слов с ошибками *
         *********************************************************/
        wrap: function (uid) {
            var defaults = $(this).showProp();
            var obj = $("[data-uid='" + uid + "']"),
                text = obj.val(),
                lastChar = text[text.length - 1],
                word = text.split(defaults[defaults['lang']]['notWord']),
                counter = 0,
                buffer = 0,
                dblSpace = /\s{2,}/g,
                firstSpase = /^\s+/,
                enter = String.fromCharCode(10);


            // Удаление пробелов перед текстом
            if (firstSpase.test(text)) {
                buffer = $(this).getCursorPosition();
                text = text.replace(firstSpase, '');
                buffer = buffer - 1;
                obj.val(text);
                $(this).selectRange(buffer);
            }


            // Удаление дублирующихся пробелов
            if (obj[0]['nodeName'] === 'INPUT' && dblSpace.test(text)) {
                buffer = $(this).getCursorPosition();
                text = text.replace(dblSpace, ' ');
                buffer = buffer - 1;
                obj.val(text);
                $(this).selectRange(buffer);
            }


            buffer = '';
            for (counter in word) {
                if (defaults[defaults['lang']]['word'].test(word[counter])) {
                    if (word[counter] in $.dictionary) {
                        if ($.dictionary[word[counter]] !== true) {
                            word[counter] = word[counter].replace(defaults[defaults['lang']]['word'], '<span class="spell_err">' + word[counter] + '</span>');
                        }
                    } else {
                        $(this).spelling(uid, word[counter]);
                    }
                }
                buffer += word[counter];
            }

            if (text[text.length - 1] === " ") {
                buffer += "$nbsp;";
            }

            if (text[text.length - 1] === enter) {
                buffer += enter + enter;
            }

            $("#cl_" + uid).html(buffer);
        },
        /*****************************************
         *  Функция для генерации уникального ID *
         *****************************************/
        uniqueID: function (length) {
            var ID = "";
            var alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            for (var i = 0; i < length; i++)
                ID += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
            return ID;
        },
        /*********************************************
         *  Функция проверки орфографии через Aspell *
         *********************************************/
        spelling: function (uid, word) {
            var params = 'check=' + word;

            $.ajax({
                url: defaults["url"],
                type: "POST",
                data: params,
                success: function (response) {
                    if (response === '1') {
                        $.dictionary[word] = true;
                    } else {
                        var rightWords = $.parseJSON(response);
                        $.dictionary[word] = rightWords;
                        $(this).wrap(uid);
                    }
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log(textStatus, errorThrown);
                }
            });

        },
        defPosition: function (event) {
            event = event || window.event;
            var x = 0,
                y = 0;
            if (document.attachEvent !== null) { // Internet Explorer & Opera
                x = window.event.clientX + (document.documentElement.scrollLeft ? document.documentElement.scrollLeft : document.body.scrollLeft);
                y = window.event.clientY + (document.documentElement.scrollTop ? document.documentElement.scrollTop : document.body.scrollTop);
            } else if (!document.attachEvent && document.addEventListener) { // Gecko
                x = event.clientX + window.scrollX;
                y = event.clientY + window.scrollY;
            } else {
                // Do nothing
            }
            return {x: x, y: y};
        },
        /*************************************************************************************************************************
         * $("#myTextBoxSelector").getCursorPosition(); // Получить позицию курсора                                               *
         * Источник: http://stackoverflow.com/questions/1891444/cursor-position-in-a-textarea-character-index-not-x-y-coordinates *
         **************************************************************************************************************************/
        getCursorPosition: function () {
            var el = $(this).get(0);
            var pos = 0;
            if ('selectionStart' in el) {
                pos = el.selectionStart;
            } else if ('selection' in document) {
                el.focus();
                var Sel = document.selection.createRange();
                var SelLength = document.selection.createRange().text.length;
                Sel.moveStart('character', -el.value.length);
                pos = Sel.text.length - SelLength;
            }
            return pos;
        },
        /***********************************************************************************************
         * $('#elem').selectRange(3,5); // Выделить текст                                              *
         * $('#elem').selectRange(3);   // Установить позицию курсора                                  *
         * Источник: http://stackoverflow.com/questions/499126/jquery-set-cursor-position-in-text-area *
         ***********************************************************************************************/
        selectRange: function (start, end) {
            if (end === undefined) {
                end = start;
            }
            return this.each(function () {
                if ('selectionStart' in this) {
                    this.selectionStart = start;
                    this.selectionEnd = end;
                } else if (this.setSelectionRange) {
                    this.setSelectionRange(start, end);
                } else if (this.createTextRange) {
                    var range = this.createTextRange();
                    range.collapse(true);
                    range.moveEnd('character', end);
                    range.moveStart('character', start);
                    range.select();
                }
            });
        }
    });
})({
    lang: 'ru',
    property: "value",
    name: "newcontact",
    url: "../spellchecker.php",
    ru: {
        chars: new RegExp('[a-яА-ЯёЁ]', 'i'),
        word: new RegExp('[а-яА-ЯёЁ]+', 'i'),
        notWord: new RegExp('([а-яА-ЯёЁ]+)', 'i')
    },
    uid: ""
}, jQuery, window, document);

/********************************************************************************************
 *  При изменении размеров окна или изменении размеров элемента (отслеживается по mouseup), *
 *  пересоздать подложку                                                                    *
 ********************************************************************************************/
$(window).on("resize mouseup", function () {
    setTimeout(function () {
        $.spellResize();
    }, 10);

});

$('html').click(function () {
    $('#spellCheckContextMenu').detach();
});


/***************************************************
 *  Когда документ загружен, добавить стили в HEAD *
 ***************************************************/
$(document).ready(function () {
    $("<style>")
        .prop("type", "text/css")
        .html("\
                .spellErr {\
                     display: block;\
                     background: #fcfcfc;\
                     color: #666;\
                     font-size: 1em;\
                     border:1px solid #f3f3f3;\
                     width:150px;\
                     padding:10px;\
                     cursor: pointer;\
                     box-shadow: 1px 1px 3px rgba(0,0,0,1);\
                }\
                .spellErr:hover {\
                    background: white;\
                    border: 1px solid #fcfcfc;\
                    font-weight: bold;\
                    font-size: 1.1em;\
                }\
                span.spell_err { border-bottom:1px solid red; font-weight: normal;}\
            ")
        .appendTo("head");

    $(document).mousemove(function (e) {
        $.mousePosX = e.pageX; // положения по оси X
        $.mousePosY = e.pageY; // положения по оси Y
    });

});

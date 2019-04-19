<?php
header('Access-Control-Allow-Origin: *');

// Функция проверки орфографии по словарям GNU Aspell
function check($word)
{
    $pspell_config = pspell_config_create("ru", "", "", "UTF-8");
    pspell_config_mode($pspell_config, PSPELL_FAST);
    $pspell_link = pspell_new_config($pspell_config);
    if (!pspell_check($pspell_link, $word)) {
        $arr = array();
        $suggestions = pspell_suggest($pspell_link, $word);
        foreach ($suggestions as $suggestion) {
            array_push($arr, $suggestion);
        }
        $json = json_encode($arr);
    } else {
        $json = true;
    }
    echo $json;
}

check(htmlspecialchars($_POST['check']));
?>
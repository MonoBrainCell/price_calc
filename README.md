<h1>Онлайн калькулятор стоимости <small>(небольшой плагин)</small></h1>
<p>Данный плагин предназначен для вычисления суммы, зависящей от значений большого количества компонентов.<br> В качестве примера можно привести подсчёт стоимости услуги, которая может иметь несколько десятков составляющих</p>
<p>Чем характерен проект?</p>
<ol>
    <li>Выполнен только с использованием frontend(js и jQuery) - никаких ajax-запросов и т.п.</li>
    <li>Что следует из п.1: вся информация по стоимости элементов находится в html-коде</li>
    <li>Поведение калькулятора не определено по умолчанию, его назначает специалист использующий данный плагин</li>
    <li>Калькулятор предусматривает:
        <ul>
            <li>Кастомизацию поведения элементов при возникновении различных событий</li>
            <li>Кастомизацию процесса получения стоимости отдельных элементов калькулятора</li>
            <li>Определения дополнительных факторов, изменяющих итоговую стоимость</li>
            <li>Настраиваемый список событий, которые должны быть вызваны для целевых элементов сразу после включения функционала калькулятора</li>
        </ul>
    </li>
</ol>
<p>Для корректной работы калькулятора необходима библиотека <strong>jQuery>=3</strong></p>
<h2>Структура репозитария</h2>
<ul>
    <li><a href="https://github.com/MonoBrainCell/price_calc/tree/main/src/costDeterminant" target="_blank">src/</a> - исходные файлы плагина</li>
    <li><a href="https://github.com/MonoBrainCell/price_calc/tree/main/example">example/</a> - пример полной реализации плагина</li>
    <li><a href="https://github.com/MonoBrainCell/price_calc/tree/main/faq.txt" target="_blank">faq.txt</a> - описание плагина и его функционала, доступного в процессе реализации</li>
</ul>
<h2>Структура примера реализации <small>(см. директорию <a href="https://github.com/MonoBrainCell/price_calc/tree/main/example" target="_blank">example</a>)</small></h2>
<ul>
    <li><a href="https://github.com/MonoBrainCell/price_calc/tree/main/example/js" target="_blank">js/</a> - папка с плагином калькулятора
        <ul>
            <li><a href="https://github.com/MonoBrainCell/price_calc/blob/main/example/js/costDeterminant.class.js" target="_blank">сostDeterminant.class.js</a> - исходный код калькулятора</li>
            <li><strong>jquery-3.2.1.min.js</strong> - библиотека jQuery</li>
        </ul>
    </li>
    <li><a href="https://github.com/MonoBrainCell/price_calc/tree/main/example/style" target="_blank">style/</a> - папка со стилями
        <ul>
            <li><a href="https://github.com/MonoBrainCell/price_calc/blob/main/example/style/style.css" target="_blank">style.css</a> - настройки отображения страницы с калькулятором</li>
        </ul>
    </li>
    <li><a href="https://github.com/MonoBrainCell/price_calc/tree/main/example/usage_example" target="_blank">usage_example/</a> - папка с js-реализацией плагина
        <ul>
            <li><a href="https://github.com/MonoBrainCell/price_calc/blob/main/example/usage_example/calculator.funcs.js" target="_blank">calculator.funcs.js</a> - js-файл, в котором реализуется калькулятор</li>
        </ul>
    </li>
    <li><a href="https://github.com/MonoBrainCell/price_calc/tree/main/example/priceList.html" target="_blank">priceList.html</a> - страница с демонстрацией работы калькулятора</li>
</ul>

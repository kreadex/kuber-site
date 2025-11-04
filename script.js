// Конфигурация структуры документации
const DOCS_STRUCTURE = [
  { 
    title: 'Общее', 
    type: 'page',
    file: 'obshee.md', 
    slug: 'obshhee', 
    icon: '📖' 
  },
  {
    title: 'Механики',
    type: 'folder',
    path: 'mehaniki',
    file: 'mehaniki.md',
    slug: 'mehaniki',
    icon: '🔌',
    items: []
  },
  {
    title: 'Проходки',
    type: 'folder',
    path: 'prohodki',
    file: 'prohodki.md',
    slug: 'prohodki',
    icon: '🎫',
    items: [
      { 
            title: 'Блогерская проходка',
            type: 'page',
            file: 'prohodki/blogerskaya.md', 
            slug: 'blogerskaya', 
            icon: '🎬' 
      },
      { 
            title: 'Платная проходка',
            type: 'page',
            file: 'prohodki/platnaya.md', 
            slug: 'platnaya', 
            icon: '💰️' 
      },
      { 
            title: 'Другое',
            type: 'page',
            file: 'prohodki/drugoe.md', 
            slug: 'drugoe', 
            icon: '❔' 
      }
    ]
  },
  {
    title: 'Правила и законы',
    type: 'folder',
    path: 'rules',
    file: 'rules.md',
    slug: 'rules',
    icon: '📖',
    items: [
      { 
            title: 'Правила общения',
            type: 'page',
            file: 'rules/pravila-obsheniya.md', 
            slug: 'pravila-obsheniya', 
            icon: '💬' 
      },
      { 
            title: 'Законы на сервере',
            type: 'page',
            file: 'rules/zakony-na-servere.md', 
            slug: 'zakony-na-servere', 
            icon: '📜' 
      },
      { 
            title: 'Прочие правила',
            type: 'page',
            file: 'rules/prochie-pravila.md', 
            slug: 'prochie-pravila', 
            icon: '📝' 
      },
      { 
            title: 'Другое',
            type: 'folder',
            path: 'rules/drugoe',
            file: 'rules/drugoe.md',
            slug: 'drugoe',
            icon: '❔',
            items: [
              { 
                title: 'Пользовательское соглашение и условия использования',
                type: 'page',
                file: 'rules/drugoe/polzovatelskoe-soglashenie-i-usloviya-ispolzovaniya.md', 
                slug: 'polzovatelskoe-soglashenie-i-usloviya-ispolzovaniya', 
                icon: '⬛️' 
              }  
            ]
      }
    ]
  }
];

// Карта маршрутов для быстрого поиска
const ROUTES_MAP = {};

// Получение текущего маршрута из URL (Hash-based)
function getCurrentRoute() {
  const hash = window.location.hash.slice(1); // Убираем # 
  
  // Игнорируем якорные ссылки (сноски, заголовки и т.д.)
  if (hash.startsWith('fn-') || 
      hash.startsWith('heading-') || 
      hash.startsWith('user-content-') ||
      hash.match(/^[a-z]+-\d+$/)) {
    console.log('Ignoring anchor hash:', hash);
    return '/';
  }
  
  return hash || '/';
}

// Установка маршрута в URL (Hash-based)
function setRoute(route) {
  window.location.hash = route;
}

// Настройка событий навигации
function setupNavigationEvents() {
  // Обработчики для всех навигационных элементов
  document.querySelectorAll('.nav-item').forEach(navItem => {
    navItem.addEventListener('click', (e) => {
      e.preventDefault();
      const route = navItem.dataset.route;
      
      if (route && ROUTES_MAP[route]) {
        setRoute(route);
        handleRouteChange();
        
        // Закрываем сайдбар на мобильных
        if (window.innerWidth <= 840) {
          const sidebar = document.getElementById('sidebar');
          if (sidebar) sidebar.classList.remove('active');
        }
      } else {
        console.error('Route not found:', route);
      }
    });
  });
}

// В функции handleRouteChange добавьте отладку:
function handleRouteChange() {
  const route = getCurrentRoute();
  
  if (route === '/') {
    // Главная страница документации - загружаем первую страницу
    const firstRoute = findFirstRoute(DOCS_STRUCTURE);
    if (firstRoute) {
      setRoute(firstRoute);
      return;
    }
  }
  
  if (ROUTES_MAP[route]) {
    // Загружаем страницу по маршруту
    loadPageByRoute(route);
  } else {
    // Страница не найдена
    console.error('Route not found in ROUTES_MAP:', route);
    show404Page(route);
  }
}

// Поиск первого доступного маршрута
function findFirstRoute(structure) {
  for (const item of structure) {
    if (item.type === 'folder' && item.file) {
      return '/' + item.slug;
    } else if (item.type === 'page') {
      return '/' + item.slug;
    }
    
    if (item.items && item.items.length > 0) {
      const nestedRoute = findFirstRoute(item.items);
      if (nestedRoute) {
        return '/' + item.slug + nestedRoute;
      }
    }
  }
  return null;
}

// Загрузка страницы по маршруту
function loadPageByRoute(route) {
  const routeData = ROUTES_MAP[route];
  if (routeData) {
    loadMarkdownFile(routeData.file, routeData.title, route);
    
    // Обновляем активный элемент в навигации
    updateActiveNavigation(route);
    
    // Обновляем хлебные крошки
    updateBreadcrumb(route, routeData.title);
  }
}

// Обновление активной навигации (только текущая страница)
function updateActiveNavigation(route) {
  // Снимаем все активные классы
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('active');
  });
  
  // Активируем только точное совпадение маршрута
  const navElement = document.querySelector(`.nav-item[data-route="${route}"]`);
  if (navElement) {
    navElement.classList.add('active');
  } else {
    console.error('Nav element not found for route:', route);
  }
}

// Обновление хлебных крошек
function updateBreadcrumb(route, title) {
  const breadcrumbContainer = document.getElementById('breadcrumb');
  if (!breadcrumbContainer) return;
  
  const parts = route.split('/').filter(part => part);
  let breadcrumbHTML = `
    <div class="breadcrumb">
      <a href="#" onclick="setRoute('/'); handleRouteChange(); return false;">Главная</a>
  `;
  
  let currentPath = '';
  parts.forEach((part, index) => {
    currentPath += '/' + part;
    const isLast = index === parts.length - 1;
    
    // Находим данные для этой части пути
    const partData = ROUTES_MAP[currentPath];
    const partTitle = partData ? partData.title : part;
    
    if (isLast) {
      breadcrumbHTML += `<span>›</span><span>${title}</span>`;
    } else {
      breadcrumbHTML += `<span>›</span><a href="#" onclick="setRoute('${currentPath}'); handleRouteChange(); return false;">${partTitle}</a>`;
    }
  });
  
  breadcrumbHTML += '</div>';
  breadcrumbContainer.innerHTML = breadcrumbHTML;
}

// Настройка Markdown парсера
function initMarkdownParser() {
  if (typeof marked === 'undefined') {
    console.warn('Marked.js not loaded');
    return;
  }
  
  marked.setOptions({
    highlight: function(code, lang) {
      if (lang && hljs && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(code, { language: lang }).value;
        } catch (err) {
          console.warn(`Error highlighting ${lang}:`, err);
        }
      }
      return code;
    },
    langPrefix: 'hljs language-',
    breaks: true,
    gfm: true,
    tables: true,
    sanitize: false
  });
}

// Рекурсивная функция для создания навигации с правильными маршрутами
function createNavigationHTML(structure = DOCS_STRUCTURE, parentPath = '') {
  let html = '';
  
  structure.forEach(item => {
    // Формируем полный маршрут для элемента
    const route = parentPath + '/' + item.slug;

    if (item.type === 'folder') {
      html += `
        <div class="nav-folder">
          <a href="#" class="nav-item" data-route="${route}">
            <span class="nav-icon">${item.icon}</span>
            <span class="nav-text">${item.title}</span>
          </a>
      `;
      
      if (item.items && item.items.length > 0) {
        html += `<div class="nav-folder-items">`;
        html += createNavigationHTML(item.items, route);
        html += `</div>`;
      }
      
      html += `</div>`;
      
    } else if (item.type === 'page') {
      html += `
        <a href="#" class="nav-item" data-route="${route}">
          <span class="nav-icon">${item.icon}</span>
          <span class="nav-text">${item.title}</span>
        </a>
      `;
    }
  });
  
  return html;
}

// Упрощенная инициализация маршрутов
function initRoutesMap(structure = DOCS_STRUCTURE, basePath = '') {
  structure.forEach(item => {
    const route = basePath + '/' + item.slug;
    
    if (item.type === 'folder') {
      // Добавляем саму папку как страницу
      if (item.file) {
        ROUTES_MAP[route] = {
          file: item.file,
          title: item.title,
          type: 'folder'
        };
      }
      
      // Рекурсивно обрабатываем вложенные элементы
      if (item.items) {
        initRoutesMap(item.items, route);
      }
    } else if (item.type === 'page') {
      // Добавляем обычную страницу
      ROUTES_MAP[route] = {
        file: item.file,
        title: item.title,
        type: 'page'
      };
    }
  });
}

// Упрощенная функция getRouteForItem (теперь не нужна в старой реализации)
function getRouteForItem(item, parentPath = '') {
  if (item.type === 'folder') {
    return parentPath + '/' + item.slug;
  } else if (item.type === 'page') {
    return parentPath + '/' + item.slug;
  }
  return '';
}

// Загрузка и отображение навигации
function loadNavigation() {
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) {
    console.error('Nav container element not found!');
    return;
  }

  const navHTML = createNavigationHTML();
  navContainer.innerHTML = navHTML;
  
  setupNavigationEvents();
}

// Настройка событий навигации
function setupNavigationEvents() {
  // Используем делегирование событий на контейнере
  const navContainer = document.getElementById('nav-container');
  if (!navContainer) {
    console.error('Nav container not found!');
    return;
  }

  navContainer.addEventListener('click', (e) => {
    // Находим ближайший элемент .nav-item
    const navItem = e.target.closest('.nav-item');
    if (!navItem) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const route = navItem.dataset.route;
    
    if (route && ROUTES_MAP[route]) {
      setRoute(route);
      
      // Закрываем сайдбар на мобильных
      if (window.innerWidth <= 840) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.remove('active');
      }
    } else {
      console.error('Route not found:', route);
    }
  });
}
  // Обработчики для навигации (и папки и файлы)
  document.querySelectorAll('.nav-folder-title, .nav-file').forEach(navItem => {
    navItem.addEventListener('click', (e) => {
      if (navItem.classList.contains('nav-folder-title') && navItem.dataset.hasChildren === 'true') {
        // Для папок с детьми обрабатываем раскрытие выше
        return;
      }
      
      e.preventDefault();
      const route = navItem.dataset.route;
      if (route) {
        setRoute(route);
        handleRouteChange();
        
        // Закрываем сайдбар на мобильных
        if (window.innerWidth <= 840) {
          const sidebar = document.getElementById('sidebar');
          if (sidebar) sidebar.classList.remove('active');
        }
      }
    });
  });

// Загрузка Markdown файла
async function loadMarkdownFile(filePath, title, route) {
  const contentContainer = document.getElementById('content');
  const loadingElement = document.getElementById('loading');
  
  if (!contentContainer) return;

  try {
    if (loadingElement) {
      loadingElement.style.display = 'block';
      contentContainer.innerHTML = '';
    }

    const response = await fetch(`docs/${filePath}`);
    
    if (!response.ok) {
      throw new Error(`Файл не найден: ${filePath}`);
    }

    const markdown = await response.text();
    const html = marked.parse(markdown);
    
    contentContainer.innerHTML = `
      <div id="breadcrumb"></div>
      <div class="markdown-body">${html}</div>
    `;

    updateBreadcrumb(route, title);

    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }

    updateTableOfContents();
    setupInternalLinks();
    
    // ДОБАВЛЕНО: Обрабатываем content-ref блоки
    setupContentRefs();
    setupHintBlocks();
    setupFootnotes();

  } catch (error) {
    console.error('Error loading markdown file:', error);
    contentContainer.innerHTML = `
      <div class="error">
        <h1>Ошибка загрузки</h1>
        <p>Не удалось загрузить файл: docs/${filePath}</p>
        <p><strong>Ошибка:</strong> ${error.message}</p>
        <div class="error-actions">
          <button class="btn btn-secondary" onclick="goToHome()">
            На главную
          </button>
        </div>
      </div>
    `;
  } finally {
    if (loadingElement) {
      loadingElement.style.display = 'none';
    }
  }
}

// Обновление оглавления
function updateTableOfContents() {
  const tocContainer = document.getElementById('toc-list');
  if (!tocContainer) return;

  const headings = document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3');
  let tocHTML = '';

  if (headings.length === 0) {
    tocHTML = '<li class="no-headings">Нет заголовков</li>';
  } else {
    headings.forEach((heading, index) => {
      let level = parseInt(heading.tagName.substring(1));
      let indent = (level - 2) * 12;
      
      // Создаем ID для заголовка
      if (!heading.id) {
        heading.id = 'heading-' + index;
      }

      tocHTML += `
        <li style="margin-left: ${indent}px">
          <a href="#${heading.id}" data-heading="${heading.id}">
            ${heading.textContent}
          </a>
        </li>
      `;
    });
  }

  tocContainer.innerHTML = tocHTML;
  setupTOCEvents();
}

// Настройка событий для TOC
function setupTOCEvents() {
  document.querySelectorAll('#toc-list a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const headingId = link.dataset.heading;
      const heading = document.getElementById(headingId);
      
      if (heading) {
        heading.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
        
        document.querySelectorAll('#toc-list a').forEach(a => a.classList.remove('active'));
        link.classList.add('active');

        if (window.innerWidth <= 840) {
          const toc = document.getElementById('toc');
          if (toc) toc.classList.remove('active');
        }
      }
    });
  });
}

// Настройка внутренних ссылок между MD файлами
function setupInternalLinks() {
  document.querySelectorAll('.markdown-body a').forEach(link => {
    const href = link.getAttribute('href');
    
    // Если это относительная ссылка на .md файл
    if (href && (href.endsWith('.md') || href.startsWith('./') || href.startsWith('../'))) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Находим соответствующий маршрут
        const targetRoute = findRouteForFile(href);
        if (targetRoute) {
          setRoute(targetRoute);
          handleRouteChange();
        }
      });
    }
  });
}

// Поиск маршрута для файла
function findRouteForFile(filePath) {
  for (const [route, data] of Object.entries(ROUTES_MAP)) {
    if (data.file === filePath || data.file.endsWith(filePath)) {
      return route;
    }
  }
  return null;
}

// Поиск по документации
function setupSearch() {
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  
  if (!searchInput || !searchResults) return;

  // Собираем индекс для поиска
  const searchIndex = [];
  for (const [route, data] of Object.entries(ROUTES_MAP)) {
    searchIndex.push({
      title: data.title,
      route: route,
      path: route.split('/').slice(1).join(' / ')
    });
  }

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (query.length < 2) {
      searchResults.innerHTML = '';
      searchResults.classList.remove('active');
      return;
    }

    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.path.toLowerCase().includes(query)
    );

    displaySearchResults(results, query);
  });

  // Горячие клавиши
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
    
    if (e.key === 'Escape') {
      searchResults.classList.remove('active');
      searchInput.blur();
    }
  });

  // Закрытие результатов при клике вне
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#search-container')) {
      searchResults.classList.remove('active');
    }
  });
}

// Отображение результатов поиска
function displaySearchResults(results, query) {
  const searchResults = document.getElementById('search-results');
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
  } else {
    searchResults.innerHTML = results.map(result => `
      <div class="search-result-item" data-route="${result.route}">
        <div class="search-result-title">${highlightText(result.title, query)}</div>
        <div class="search-result-path">${result.path}</div>
      </div>
    `).join('');
  }

  searchResults.classList.add('active');
  
  // Обработчики для результатов поиска
  document.querySelectorAll('.search-result-item').forEach(item => {
    item.addEventListener('click', () => {
      const route = item.dataset.route;
      setRoute(route);
      handleRouteChange();
      searchResults.classList.remove('active');
      searchInput.value = '';
    });
  });
}

// Подсветка текста в поиске
function highlightText(text, query) {
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// Управление мобильным меню
function setupMobileMenu() {
  const btnMenu = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const toc = document.getElementById('toc');
  
  if (btnMenu && sidebar) {
    btnMenu.addEventListener('click', () => {
      sidebar.classList.toggle('active');
      if (toc && window.innerWidth <= 840) {
        toc.classList.remove('active');
      }
    });
  }

  // Закрытие при клике вне
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 840) {
      const sidebar = document.getElementById('sidebar');
      const toc = document.getElementById('toc');
      const menuToggle = document.getElementById('menu-toggle');
      const tocToggle = document.getElementById('toc-toggle');
      
      if (sidebar && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('active');
      }
      
      if (toc && !toc.contains(e.target) && !tocToggle.contains(e.target)) {
        toc.classList.remove('active');
      }
    }
  });
}

// Управление TOC на мобильных
function setupTocToggle() {
  const tocToggle = document.getElementById('toc-toggle');
  const toc = document.getElementById('toc');
  const tocClose = document.getElementById('toc-close');
  
  if (tocToggle && toc) {
    function updateTocToggle() {
      if (window.innerWidth <= 840) {
        tocToggle.style.display = 'flex';
      } else {
        tocToggle.style.display = 'none';
        toc.classList.remove('active');
      }
    }
    
    tocToggle.addEventListener('click', () => {
      toc.classList.toggle('active');
      const sidebar = document.getElementById('sidebar');
      if (sidebar) sidebar.classList.remove('active');
    });
    
    if (tocClose) {
      tocClose.addEventListener('click', () => {
        toc.classList.remove('active');
      });
    }
    
    window.addEventListener('resize', updateTocToggle);
    updateTocToggle();
  }
}

// Страница 404
function show404Page(route) {
  const contentContainer = document.getElementById('content');
  if (!contentContainer) return;
  
  contentContainer.innerHTML = `
    <div class="error-page">
      <h1>404 - Страница не найдена</h1>
      <p>Запрошенная страница <strong>${route}</strong> не существует.</p>
      <div class="error-actions">
        <button class="btn btn-primary" onclick="goToHome()">На главную</button>
        <button class="btn btn-secondary" onclick="showAllPages()">Все страницы</button>
      </div>
    </div>
  `;
}

// Переход на главную
function goToHome() {
  setRoute('/');
  handleRouteChange();
}

// Показать все доступные страницы
function showAllPages() {
  const contentContainer = document.getElementById('content');
  if (!contentContainer) return;
  
  let pagesHTML = '<div class="all-pages"><h1>Все страницы документации</h1><div class="pages-grid">';
  
  function addPagesToHTML(structure, level = 0) {
    structure.forEach(item => {
      const route = getFullRoute(item);
      const indent = '  '.repeat(level);
      
      if (item.type === 'folder' && item.file) {
        pagesHTML += `
          <div class="pages-item pages-folder">
            <a href="#" onclick="setRoute('${route}'); handleRouteChange(); return false;">
              ${item.icon} ${item.title}
            </a>
          </div>
        `;
        
        if (item.items) {
          addPagesToHTML(item.items, level + 1);
        }
      } else if (item.type === 'page') {
        pagesHTML += `
          <div class="pages-item pages-page">
            <a href="#" onclick="setRoute('${route}'); handleRouteChange(); return false;">
              ${item.icon} ${item.title}
            </a>
          </div>
        `;
      }
    });
  }
  
  addPagesToHTML(DOCS_STRUCTURE);
  pagesHTML += '</div></div>';
  contentContainer.innerHTML = pagesHTML;
}

// Получение полного маршрута для элемента
function getFullRoute(item, parentPath = '') {
  if (item.type === 'folder') {
    return parentPath + '/' + item.slug;
  } else if (item.type === 'page') {
    return parentPath + '/' + item.slug;
  }
  return '';
}

// Создание примера MD файла
function createSampleFile(filePath) {
  const fileName = filePath.split('/').pop();
  const title = fileName.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  const sampleContent = `# ${title}
  
Добро пожаловать в документацию!

## Описание

Это автоматически созданный файл документации.

## Основные разделы

### Функции
- Функция 1
- Функция 2
- Функция 3

### Использование

\`\`\`javascript
// Пример кода
function example() {
  console.log("Hello World!");
}
\`\`\`

## Таблица параметров

| Параметр | Тип | Описание |
|----------|-----|----------|
| param1   | string | Первый параметр |
| param2   | number | Второй параметр |

> 💡 **Примечание**: Это пример документации
`;

  // Создаем и скачиваем файл
  const blob = new Blob([sampleContent], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
  
  alert(`Файл ${fileName} создан! Сохраните его в папку docs/${filePath}`);
}

// Инициализация темы
function initTheme() {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let theme = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  return theme;
}

// Переключение темы
function setupThemeToggle() {
  const btnTheme = document.getElementById('theme-toggle');
  if (!btnTheme) return;
  
  let theme = initTheme();
  
  btnTheme.addEventListener('click', () => {
    theme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  });
}

// Плавная прокрутка
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
  // Инициализация маршрутов
  initRoutesMap();
  
  // Общие функции
  setupThemeToggle();
  setupSmoothScroll();
  
  // Документация
  if (document.querySelector('.docs')) {
    initMarkdownParser();
    loadNavigation();
    setupSearch();
    setupMobileMenu();
    setupTocToggle();
    
    // Обработка изменений URL (назад/вперед)
    window.addEventListener('hashchange', handleRouteChange);
    
    // Загружаем текущий маршрут
    handleRouteChange();
  }
});

// Функция для обработки специальных блоков ссылок в Markdown
function setupContentRefs() {
  console.log('Setting up content references...');
  
  const contentContainers = document.querySelectorAll('.markdown-body');
  contentContainers.forEach(container => {
    let html = container.innerHTML;
    
    // Обрабатываем полные блоки content-ref с закрывающим тегом
    const fullBlockRegex = /\{%\s*content-ref\s+url="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endcontent-ref\s*%\}/g;
    html = html.replace(fullBlockRegex, (match, url, content) => {
      console.log('Processing full content-ref block:', url);
      return createContentRefBlock(url);
    });
    
    // Обрабатываем одиночные content-ref
    const singleRefRegex = /\{%\s*content-ref\s+url="([^"]+)"\s*%\}/g;
    html = html.replace(singleRefRegex, (match, url) => {
      console.log('Processing single content-ref:', url);
      return createContentRefBlock(url);
    });
    
    if (html !== container.innerHTML) {
      container.innerHTML = html;
    }
    
    // Настраиваем клики на созданных блоках
    setupContentRefEvents();
  });
}

// Создание блока ссылки
function createContentRefBlock(url) {
  console.log('Creating content ref for URL:', url);
  
  // Проверяем является ли ссылка внутренней (относительный путь или .md файл)
  const isInternalLink = !url.startsWith('http') && (url.includes('.md') || url.startsWith('./') || url.startsWith('../'));
  
  if (isInternalLink) {
    const routeData = findRouteByUrl(url);
    
    if (routeData) {
      return `
        <div class="content-ref" data-route="${routeData.route}">
          <div class="content-ref-icon">📄</div>
          <div class="content-ref-content">
            <div class="content-ref-title">${routeData.title}</div>
            <div class="content-ref-description">${routeData.description || 'Перейти к разделу'}</div>
          </div>
          <div class="content-ref-arrow">→</div>
        </div>
      `;
    } else {
      // Если внутренняя ссылка не найдена, показываем URL как есть
      const fileName = url.split('/').pop().replace('.md', '').replace(/-/g, ' ');
      const title = fileName.charAt(0).toUpperCase() + fileName.slice(1);
      
      return `
        <div class="content-ref content-ref-not-found">
          <div class="content-ref-icon">❓</div>
          <div class="content-ref-content">
            <div class="content-ref-title">${title}</div>
            <div class="content-ref-description">Страница не найдена: ${url}</div>
          </div>
          <div class="content-ref-arrow">→</div>
        </div>
      `;
    }
  } else {
    // Внешняя ссылка - извлекаем домен для красивого отображения
    const domain = extractDomain(url);
    return `
      <a href="${url}" class="content-ref content-ref-external" target="_blank" rel="noopener">
        <div class="content-ref-icon">🔗</div>
        <div class="content-ref-content">
          <div class="content-ref-title">${domain}</div>
          <div class="content-ref-description">Внешний ресурс</div>
        </div>
        <div class="content-ref-arrow">↗</div>
      </a>
    `;
  }
}

// Функция для извлечения домена из URL
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname;
    return domain.replace('www.', '');
  } catch {
    return url;
  }
}

// Поиск маршрута по URL
function findRouteByUrl(url) {
  console.log('Finding route for URL:', url);
  
  // Нормализуем URL
  let cleanUrl = url;
  
  // Убираем расширение .md если есть
  cleanUrl = cleanUrl.replace('.md', '');
  
  // Убираем начальные ./ и ../
  cleanUrl = cleanUrl.replace(/^\.\//, '').replace(/^\.\.\//, '');
  
  console.log('Normalized URL:', cleanUrl);
  
  // Сначала ищем точное совпадение по полному пути файла
  for (const [route, data] of Object.entries(ROUTES_MAP)) {
    if (data.file === url || data.file.replace('.md', '') === cleanUrl) {
      console.log('Found by exact file match:', route);
      return {
        route: route,
        title: data.title,
        description: getPageDescription(data)
      };
    }
  }
  
  // Ищем по частичному совпадению файла
  for (const [route, data] of Object.entries(ROUTES_MAP)) {
    if (data.file.includes(cleanUrl) || data.file.replace('.md', '').includes(cleanUrl)) {
      console.log('Found by partial file match:', route);
      return {
        route: route,
        title: data.title,
        description: getPageDescription(data)
      };
    }
  }
  
  // Ищем по slug в маршруте
  for (const [route, data] of Object.entries(ROUTES_MAP)) {
    if (route.includes(cleanUrl) || data.slug === cleanUrl) {
      console.log('Found by route/slug match:', route);
      return {
        route: route,
        title: data.title,
        description: getPageDescription(data)
      };
    }
  }
  
  // Ищем в структуре документации
  const foundInStructure = findInStructure(DOCS_STRUCTURE, cleanUrl);
  if (foundInStructure) {
    console.log('Found in structure:', foundInStructure.route);
    return foundInStructure;
  }
  
  console.log('Route not found for URL:', url);
  return null;
}

// Рекурсивный поиск в структуре документации
function findInStructure(structure, searchUrl, currentPath = '') {
  for (const item of structure) {
    const route = currentPath + '/' + item.slug;
    
    // Проверяем совпадение по файлу
    if (item.file && (item.file.includes(searchUrl) || item.file.replace('.md', '') === searchUrl)) {
      return {
        route: route,
        title: item.title,
        description: getPageDescription(item)
      };
    }
    
    // Проверяем совпадение по slug
    if (item.slug === searchUrl || route.includes(searchUrl)) {
      return {
        route: route,
        title: item.title,
        description: getPageDescription(item)
      };
    }
    
    // Рекурсивно проверяем вложенные элементы
    if (item.items && item.items.length > 0) {
      const found = findInStructure(item.items, searchUrl, route);
      if (found) return found;
    }
  }
  return null;
}

// Получение описания страницы (можно расширить)
function getPageDescription(routeData) {
  if (routeData.type === 'folder') {
    return 'Раздел документации';
  } else {
    return 'Страница документации';
  }
}

// Функция для обработки специальных блоков ссылок в Markdown
function setupContentRefs() {
  console.log('Setting up content references...');
  
  const contentContainers = document.querySelectorAll('.markdown-body');
  
  contentContainers.forEach(container => {
    try {
      if (!container) {
        console.warn('Container is null');
        return;
      }
      
      const html = container.innerHTML;
      if (!html) {
        console.warn('Container innerHTML is empty');
        return;
      }
      
      // Простая замена: находим каждый content-ref тег и заменяем его
      let newHtml = html;
      let replaced = false;
      
      // Обрабатываем все content-ref теги
      const regex = /\{%\s*content-ref\s+url="([^"]+)"\s*%\}/g;
      
      newHtml = newHtml.replace(regex, (match, url) => {
        console.log('Replacing content-ref with URL:', url);
        replaced = true;
        return createContentRefBlock(url);
      });
      
      // Также убираем endcontent-ref теги
      newHtml = newHtml.replace(/\{%\s*endcontent-ref\s*%\}/g, '');
      
      if (replaced && newHtml !== html) {
        container.innerHTML = newHtml;
        setupContentRefEvents();
      }
      
    } catch (error) {
      console.error('Error in setupContentRefs:', error);
    }
  });
}

// Настройка событий для content-ref блоков
function setupContentRefEvents() {
  
  // Внутренние ссылки
  const internalRefs = document.querySelectorAll('.content-ref:not(.content-ref-external):not(.content-ref-not-found)');
  
  internalRefs.forEach(ref => {
    // Удаляем старые обработчики если они есть
    ref.replaceWith(ref.cloneNode(true));
  });
  
  // Добавляем новые обработчики
  document.querySelectorAll('.content-ref:not(.content-ref-external):not(.content-ref-not-found)').forEach(ref => {
    ref.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const route = ref.dataset.route;
      console.log('Content ref clicked, route:', route);
      
      if (route && ROUTES_MAP[route]) {
        console.log('Navigating to:', route);
        setRoute(route);
        handleRouteChange();
      } else {
        console.error('Route not found or not in ROUTES_MAP:', route);
      }
    });
    
    // Добавляем курсор указателя
    ref.style.cursor = 'pointer';
  });
  
  // Внешние ссылки уже работают через <a> теги
  const externalRefs = document.querySelectorAll('.content-ref-external');
  console.log('Found external content refs:', externalRefs.length);
}

// Функция для обработки hint блоков
function setupHintBlocks() {
  console.log('Setting up hint blocks...');
  
  const contentContainers = document.querySelectorAll('.markdown-body');
  contentContainers.forEach(container => {
    try {
      if (!container) return;
      
      let html = container.innerHTML;
      
      // Обрабатываем hint блоки
      const hintRegex = /\{%\s*hint\s+style="([^"]+)"\s*%\}([\s\S]*?)\{%\s*endhint\s*%\}/g;
      
      html = html.replace(hintRegex, (match, style, content) => {
        console.log('Processing hint block:', style, content);
        return createHintBlock(style, content.trim());
      });
      
      if (html !== container.innerHTML) {
        container.innerHTML = html;
      }
      
    } catch (error) {
      console.error('Error in setupHintBlocks:', error);
    }
  });
}

// Создание hint блока
function createHintBlock(style, content) {
  const styles = {
    'info': { icon: '💡', title: 'Информация', class: 'hint-info' },
    'warning': { icon: '⚠️', title: 'Внимание', class: 'hint-warning' },
    'danger': { icon: '🚫', title: 'Важно', class: 'hint-danger' },
    'success': { icon: '✅', title: 'Успех', class: 'hint-success' },
    'tip': { icon: '💡', title: 'Совет', class: 'hint-tip' },
    'note': { icon: '📝', title: 'Примечание', class: 'hint-note' }
  };
  
  const hintStyle = styles[style] || styles['info'];
  
  return `
    <div class="hint-block ${hintStyle.class}">
      <div class="hint-header">
        <span class="hint-icon">${hintStyle.icon}</span>
        <span class="hint-title">${hintStyle.title}</span>
      </div>
      <div class="hint-content">
        ${content}
      </div>
    </div>
  `;
}

// Функция для обработки сносок (footnotes)
function setupFootnotes() {
  console.log('Setting up footnotes...');
  
  const contentContainers = document.querySelectorAll('.markdown-body');
  contentContainers.forEach(container => {
    try {
      if (!container) return;
      
      let html = container.innerHTML;
      
      // Обрабатываем сноски в тексте [^1]
      const footnoteRefRegex = /\[\^(\d+)\]/g;
      html = html.replace(footnoteRefRegex, (match, number) => {
        return `<sup id="fnref-${number}"><a href="#fn-${number}" class="footnote-ref">${number}</a></sup>`;
      });
      
      // Обрабатываем определения сносок [^1]: текст
      const footnoteDefRegex = /\[\^(\d+)\]:\s*([^\n]+)/g;
      const footnotes = [];
      let footnoteMatch;
      
      // Собираем все сноски
      while ((footnoteMatch = footnoteDefRegex.exec(html)) !== null) {
        footnotes.push({
          number: footnoteMatch[1],
          text: footnoteMatch[2]
        });
      }
      
      // Убираем определения сносок из основного текста
      html = html.replace(/\[\^\d+\]:\s*[^\n]+/g, '');
      
      // Добавляем блок сноскок в конец, если они есть
      if (footnotes.length > 0) {
        const footnotesHTML = createFootnotesBlock(footnotes);
        html += footnotesHTML;
      }
      
      if (html !== container.innerHTML) {
        container.innerHTML = html;
      }
      
    } catch (error) {
      console.error('Error in setupFootnotes:', error);
    }
  });
}

// Создание блока сносок
function createFootnotesBlock(footnotes) {
  let html = `
    <div class="footnotes">
      <hr />
      <ol>
  `;
  
  footnotes.forEach(fn => {
    html += `
      <li id="fn-${fn.number}">
        <span class="footnote-text">${fn.text}</span>
        <a href="#fnref-${fn.number}" class="footnote-backref">↩</a>
      </li>
    `;
  });
  
  html += `
      </ol>
    </div>
  `;
  
  return html;
} 
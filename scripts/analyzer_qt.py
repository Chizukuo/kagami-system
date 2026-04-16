# coding: utf-8
"""
Kagami Research Data Analyzer
A professional academic data analysis platform for Kagami diagnostic research.
Supports multi-language interface with hot-refresh and data exploration.
"""

import sys
import os
import json
import pandas as pd
import requests
import matplotlib
matplotlib.use('QtAgg')
from matplotlib import font_manager, rcParams

# Fix Windows console encoding
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QLabel, QLineEdit, QPushButton, QTabWidget, QTableWidget,
    QTableWidgetItem, QMessageBox, QHeaderView, QFileDialog
)
from PyQt6.QtCore import Qt, QSettings, pyqtSignal, QObject
from PyQt6.QtGui import QFont
from matplotlib.backends.backend_qtagg import FigureCanvasQTAgg as FigureCanvas
from matplotlib.figure import Figure
import seaborn as sns


# ════════════════════════════════════════════════════════════════════════════════
# Language Switcher Signal
# ════════════════════════════════════════════════════════════════════════════════

class LanguageSignal(QObject):
    changed = pyqtSignal(str)

lang_signal = LanguageSignal()


# ════════════════════════════════════════════════════════════════════════════════
# Internationalization (i18n)
# ════════════════════════════════════════════════════════════════════════════════

I18N = {
    'en': {
        'app_title': 'Kagami Research Data Analyzer',
        'app_subtitle': 'Professional diagnostic data exploration and visualization',
        'menu_file': '&File', 'menu_language': '&Language', 'menu_help': '&Help',
        'action_exit': 'E&xit', 'action_about': '&About',
        'sidebar_title': 'Data Connection',
        'sidebar_api_label': '🔗 API Base URL',
        'sidebar_api_placeholder': 'e.g., https://kagami.chizunet.cc',
        'sidebar_token_label': '🔐 Access Token',
        'sidebar_token_placeholder': 'Enter export token',
        'sidebar_fetch_btn': '📂 Fetch & Analyze Data',
        'sidebar_status_waiting': 'Ready to fetch data',
        'tab_hierarchy': '📊 Layer-wise Acceptance Analysis',
        'tab_severity': '🔥 Acceptance × Issue Density',
        'tab_models': '🤖 Cross-Model Comparison',
        'tab_eval_raw': '📋 Evaluation Data (Raw)',
        'tab_issue_raw': '📋 Issue Feedback (Raw)',
        'table_filter_label': 'Filter:',
        'table_filter_placeholder': 'Enter keyword to filter',
        'table_export_btn': 'Export CSV',
        'table_count_format': '{} / {}',
        'fetch_running': 'Fetching data...', 'fetch_progress': 'Processing...',
        'fetch_success_title': 'Success', 'fetch_success_msg': 'Data loaded successfully.',
        'fetch_success_status': 'Loaded: {} evaluations, {} feedback entries',
        'error_network': 'Network Error', 'error_network_msg': 'Failed to connect: {}',
        'error_json': 'Data Format Error', 'error_json_msg': 'Invalid JSON: {}',
        'error_processing': 'Processing Error', 'error_processing_msg': 'Processing failed: {}',
        'error_table_fill': 'Table Error', 'error_table_fill_msg': 'Cannot populate: {}',
        'error_export_empty': 'Cannot Export', 'error_export_empty_msg': 'No data to export.',
        'chart_hierarchy_title': 'Feedback Distribution by Layer',
        'chart_hierarchy_ylabel': 'Number of Responses', 'chart_hierarchy_xlabel': 'Language Layer',
        'chart_hierarchy_agree': 'Agree', 'chart_hierarchy_disagree': 'Disagree',
        'chart_hierarchy_rate': 'Agreement Rate: {}%', 'chart_hierarchy_empty': 'No feedback data',
        'chart_severity_title': 'Acceptance vs. Issue Density',
        'chart_severity_ylabel': 'Issue Density', 'chart_severity_xlabel': 'Helpfulness',
        'chart_severity_low': 'Low', 'chart_severity_medium': 'Medium', 'chart_severity_high': 'High',
        'chart_severity_helpful': 'Helpful', 'chart_severity_partial': 'Partially', 'chart_severity_unhelpful': 'Not Helpful',
        'chart_severity_empty': 'No evaluation data', 'chart_severity_incomplete': 'Missing fields',
    },
    'zh': {
        'app_title': 'Kagami 研究数据分析器', 'app_subtitle': '专业诊断数据探索与可视化平台',
        'menu_file': '文件(&F)', 'menu_language': '语言(&L)', 'menu_help': '帮助(&H)',
        'action_exit': '退出(&X)', 'action_about': '关于(&A)',
        'sidebar_title': '数据连接',
        'sidebar_api_label': '🔗 API 基础地址', 'sidebar_api_placeholder': '例如：https://kagami.chizunet.cc',
        'sidebar_token_label': '🔐 访问令牌', 'sidebar_token_placeholder': '输入导出令牌',
        'sidebar_fetch_btn': '📂 抓取并分析数据', 'sidebar_status_waiting': '准备就绪',
        'tab_hierarchy': '📊 分层接受度分析', 'tab_severity': '🔥 接受度 × 问题密度',
        'tab_models': '🤖 跨模型接受率比较',
        'tab_eval_raw': '📋 评估数据（原始）', 'tab_issue_raw': '📋 反馈数据（原始）',
        'table_filter_label': '筛选：', 'table_filter_placeholder': '输入关键词筛选',
        'table_export_btn': '导出 CSV', 'table_count_format': '{} / {}',
        'fetch_running': '正在抓取...', 'fetch_progress': '处理数据中...',
        'fetch_success_title': '加载成功', 'fetch_success_msg': '数据已加载。',
        'fetch_success_status': '已加载：{} 条评估，{} 条反馈',
        'error_network': '网络错误', 'error_network_msg': '无法连接：{}',
        'error_json': '格式错误', 'error_json_msg': '无效JSON：{}',
        'error_processing': '处理错误', 'error_processing_msg': '处理失败：{}',
        'error_table_fill': '表格错误', 'error_table_fill_msg': '无法填充：{}',
        'error_export_empty': '无法导出', 'error_export_empty_msg': '无可导出数据。',
        'chart_hierarchy_title': '各层级反馈分布',
        'chart_hierarchy_ylabel': '反馈次数', 'chart_hierarchy_xlabel': '语言层级',
        'chart_hierarchy_agree': '同意', 'chart_hierarchy_disagree': '不同意',
        'chart_hierarchy_rate': '同意率：{}%', 'chart_hierarchy_empty': '无反馈数据',
        'chart_severity_title': '接受度 × 问题密度',
        'chart_severity_ylabel': '问题密度', 'chart_severity_xlabel': '有用性',
        'chart_severity_low': '低', 'chart_severity_medium': '中', 'chart_severity_high': '高',
        'chart_severity_helpful': '有帮助', 'chart_severity_partial': '部分', 'chart_severity_unhelpful': '无帮助',
        'chart_severity_empty': '无评估数据', 'chart_severity_incomplete': '字段不完整',
    },
    'ja': {
        'app_title': 'Kagamiリサーチアナライザー', 'app_subtitle': 'プロ診断データ探索・可視化',
        'menu_file': 'ファイル(&F)', 'menu_language': '言語(&L)', 'menu_help': 'ヘルプ(&H)',
        'action_exit': '終了(&X)', 'action_about': 'について(&A)',
        'sidebar_title': 'データ接続',
        'sidebar_api_label': '🔗 API URL', 'sidebar_api_placeholder': '例：https://kagami.chizunet.cc',
        'sidebar_token_label': '🔐 トークン', 'sidebar_token_placeholder': 'トークンを入力',
        'sidebar_fetch_btn': '📂 取得・分析', 'sidebar_status_waiting': '準備完了',
        'tab_hierarchy': '📊 層別受容率分析', 'tab_severity': '🔥 受容率 × 密度',
        'tab_models': '🤖 モデル間比較',
        'tab_eval_raw': '📋 評価データ（生）', 'tab_issue_raw': '📋 フィード（生）',
        'table_filter_label': 'フィルタ：', 'table_filter_placeholder': 'キーワード',
        'table_export_btn': 'CSV出力', 'table_count_format': '{} / {}',
        'fetch_running': '取得中...', 'fetch_progress': '処理中...',
        'fetch_success_title': '成功', 'fetch_success_msg': 'データロード完了。',
        'fetch_success_status': 'ロード：{} 評価、{} フィード',
        'error_network': 'ネットワーク', 'error_network_msg': '接続失敗：{}',
        'error_json': 'フォーマット', 'error_json_msg': '無効JSON：{}',
        'error_processing': '処理エラー', 'error_processing_msg': '失敗：{}',
        'error_table_fill': 'テーブル', 'error_table_fill_msg': '入力失敗：{}',
        'error_export_empty': '出力不可', 'error_export_empty_msg': 'データなし。',
        'chart_hierarchy_title': 'フィード分布',
        'chart_hierarchy_ylabel': 'フィード数', 'chart_hierarchy_xlabel': '言語層',
        'chart_hierarchy_agree': '納得', 'chart_hierarchy_disagree': 'そう思わない',
        'chart_hierarchy_rate': '納得率：{}%', 'chart_hierarchy_empty': 'データなし',
        'chart_severity_title': '受容率 × 密度',
        'chart_severity_ylabel': '密度', 'chart_severity_xlabel': '有用性',
        'chart_severity_low': '低', 'chart_severity_medium': '中', 'chart_severity_high': '高',
        'chart_severity_helpful': '参考', 'chart_severity_partial': '一部', 'chart_severity_unhelpful': 'なし',
        'chart_severity_empty': 'データなし', 'chart_severity_incomplete': '不完全',
    }
}

def get_i18n(lang, key, *args):
    try:
        text = I18N.get(lang, I18N['en']).get(key, key)
        return text.format(*args) if args else text
    except:
        return key

def configure_matplotlib_font():
    candidates = ['Microsoft YaHei', 'SimHei', 'PingFang SC', 'Noto Sans CJK SC']
    available = {f.name for f in font_manager.fontManager.ttflist}
    picked = next((n for n in candidates if n in available), None)
    if picked:
        rcParams['font.family'], rcParams['font.sans-serif'] = 'sans-serif', [picked, 'DejaVu Sans']
    else:
        rcParams['font.sans-serif'] = ['DejaVu Sans']
    rcParams['axes.unicode_minus'] = False

def safe_display_str(value):
    if value is None:
        return ""
    if isinstance(value, (list, tuple, set)):
        return json.dumps(list(value), ensure_ascii=False)
    if isinstance(value, dict):
        return json.dumps(value, ensure_ascii=False)
    try:
        if isinstance(pd.isna(value), bool) and pd.isna(value):
            return ""
    except:
        pass
    return str(value)

def build_sort_key(value):
    if value is None:
        return (2, '')
    if isinstance(value, (list, tuple, set)):
        return (1, json.dumps(list(value), ensure_ascii=False).lower())
    if isinstance(value, dict):
        return (1, json.dumps(value, ensure_ascii=False, sort_keys=True).lower())
    try:
        if isinstance(pd.isna(value), bool) and pd.isna(value):
            return (2, '')
    except:
        pass
    if isinstance(value, (int, float)):
        return (0, float(value))
    text = str(value).strip()
    try:
        return (0, float(text))
    except:
        return (1, text.lower())

class SortableTableWidgetItem(QTableWidgetItem):
    def __lt__(self, other):
        left = self.data(Qt.ItemDataRole.UserRole)
        right = other.data(Qt.ItemDataRole.UserRole)
        return left < right

class KagamiAnalyzerWindow(QMainWindow):
    def __init__(self, initial_lang='en'):
        super().__init__()
        self.settings = QSettings('Kagami', 'ResearchAnalyzer')
        self.current_lang = self.settings.value('language', initial_lang, type=str)
        self.setWindowTitle(get_i18n(self.current_lang, 'app_title'))
        self.resize(1500, 920)
        lang_signal.changed.connect(self.on_language_changed)
        self.setup_ui()

    def setup_ui(self):
        self.setup_stylesheet()
        if self.centralWidget():
            self.centralWidget().deleteLater()
        self.create_menu_bar()
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        self.create_sidebar()
        main_layout.addWidget(self.sidebar, 0)
        self.tabs = QTabWidget()
        self.create_tabs()
        main_layout.addWidget(self.tabs, 1)
        self.df_eval = pd.DataFrame()
        self.df_issue = pd.DataFrame()
        self.url_input.editingFinished.connect(self.save_persistent_settings)
        self.token_input.editingFinished.connect(self.save_persistent_settings)
        self.load_persistent_settings()

    def setup_stylesheet(self):
        self.setStyleSheet("""
            QMainWindow { background-color: #fafbfc; }
            QMenuBar { background-color: white; border-bottom: 1px solid #d0d7de; color: #24292f; font-size: 13px; }
            QMenuBar::item:selected { background-color: #f3f4f6; }
            QMenu { background-color: white; border: 1px solid #d0d7de; color: #24292f; font-size: 13px; }
            QMenu::item:selected { background-color: #f3f4f6; }
            QLabel { color: #24292f; font-size: 13px; }
            QLineEdit { border: 1px solid #d0d7de; border-radius: 5px; padding: 9px 10px;
                background-color: white; color: #24292f; font-size: 13px; selection-background-color: #0969da; }
            QLineEdit:focus { border: 2px solid #0969da; }
            QPushButton { background-color: #0969da; color: white; border: none; border-radius: 6px;
                padding: 11px 14px; font-size: 13px; font-weight: 500; }
            QPushButton:hover { background-color: #0860ca; }
            QPushButton:pressed { background-color: #033d8b; }
            QPushButton:disabled { background-color: #eaeef2; color: #57606a; }
            QTabWidget::pane { border-left: 1px solid #d0d7de; background-color: white; }
            QTabBar::tab { background-color: #f6f8fb; padding: 12px 18px; margin-right: 4px; color: #424f5f;
                border: none; border-bottom: 2px solid transparent; font-size: 13px; }
            QTabBar::tab:selected { background-color: white; color: #0969da; border-bottom: 2px solid #0969da; font-weight: 600; }
            QTabBar::tab:hover:!selected { background-color: #eaecf0; }
            QTableWidget { gridline-color: #eaeef2; background-color: white; border: 1px solid #d0d7de; border-radius: 3px; color: #24292f; }
            QTableWidget::item { padding: 4px; }
            QTableWidget::item:selected { background-color: #fff8c5; }
            QHeaderView::section { background-color: #f6f8fb; padding: 9px 10px; border: none;
                border-right: 1px solid #d0d7de; border-bottom: 1px solid #d0d7de;
                font-weight: 600; color: #24292f; font-size: 12px; }
        """)

    def create_menu_bar(self):
        menubar = self.menuBar()
        menubar.clear()
        file_menu = menubar.addMenu(get_i18n(self.current_lang, 'menu_file'))
        file_menu.addAction(get_i18n(self.current_lang, 'action_exit')).triggered.connect(self.close)
        lang_menu = menubar.addMenu(get_i18n(self.current_lang, 'menu_language'))
        lang_menu.addAction('English').triggered.connect(lambda: self.set_language('en'))
        lang_menu.addAction('中文').triggered.connect(lambda: self.set_language('zh'))
        lang_menu.addAction('日本語').triggered.connect(lambda: self.set_language('ja'))
        help_menu = menubar.addMenu(get_i18n(self.current_lang, 'menu_help'))
        help_menu.addAction(get_i18n(self.current_lang, 'action_about')).triggered.connect(self.show_about)

    def create_sidebar(self):
        self.sidebar = QWidget()
        self.sidebar.setObjectName("sidebarContainer")
        self.sidebar.setFixedWidth(400)
        self.sidebar.setStyleSheet("#sidebarContainer { background-color: #ffffff; border-right: 1px solid #d0d7de; }")
        layout = QVBoxLayout(self.sidebar)
        layout.setContentsMargins(24, 24, 24, 24)
        layout.setSpacing(16)
        title = QLabel(get_i18n(self.current_lang, 'sidebar_title'))
        title.setFont(QFont('Segoe UI', 16, QFont.Weight.Bold))
        title.setStyleSheet("color: #0969da; margin-bottom: 6px;")
        layout.addWidget(title)
        subtitle = QLabel(get_i18n(self.current_lang, 'app_subtitle'))
        subtitle.setStyleSheet("color: #57606a; font-size: 12px; line-height: 1.6;")
        subtitle.setWordWrap(True)
        layout.addWidget(subtitle)
        layout.addSpacing(12)
        api_label = QLabel(get_i18n(self.current_lang, 'sidebar_api_label'))
        api_label.setStyleSheet("font-weight: 500; color: #2c3e50;")
        layout.addWidget(api_label)
        self.url_input = QLineEdit()
        self.url_input.setPlaceholderText(get_i18n(self.current_lang, 'sidebar_api_placeholder'))
        self.url_input.setMinimumHeight(38)
        layout.addWidget(self.url_input)
        token_label = QLabel(get_i18n(self.current_lang, 'sidebar_token_label'))
        token_label.setStyleSheet("font-weight: 500; color: #2c3e50; margin-top: 4px;")
        layout.addWidget(token_label)
        self.token_input = QLineEdit()
        self.token_input.setEchoMode(QLineEdit.EchoMode.Password)
        self.token_input.setPlaceholderText(get_i18n(self.current_lang, 'sidebar_token_placeholder'))
        self.token_input.setMinimumHeight(38)
        layout.addWidget(self.token_input)
        layout.addSpacing(14)
        self.fetch_btn = QPushButton(get_i18n(self.current_lang, 'sidebar_fetch_btn'))
        self.fetch_btn.setMinimumHeight(46)
        self.fetch_btn.setCursor(Qt.CursorShape.PointingHandCursor)
        self.fetch_btn.setFont(QFont('Segoe UI', 13, QFont.Weight.Medium))
        self.fetch_btn.clicked.connect(self.fetch_and_analyze)
        layout.addWidget(self.fetch_btn)
        self.status_label = QLabel(get_i18n(self.current_lang, 'sidebar_status_waiting'))
        self.status_label.setWordWrap(True)
        self.status_label.setStyleSheet("color: #57606a; font-size: 12px; line-height: 1.7; margin-top: 12px;")
        layout.addWidget(self.status_label)
        layout.addStretch()

    def create_tabs(self):
        self.tab_hierarchy = QWidget()
        self.tab_severity = QWidget()
        self.tab_models = QWidget()
        self.tab_eval_raw = QWidget()
        self.tab_issue_raw = QWidget()
        self.tabs.addTab(self.tab_hierarchy, get_i18n(self.current_lang, 'tab_hierarchy'))
        self.tabs.addTab(self.tab_severity, get_i18n(self.current_lang, 'tab_severity'))
        self.tabs.addTab(self.tab_models, get_i18n(self.current_lang, 'tab_models'))
        self.tabs.addTab(self.tab_eval_raw, get_i18n(self.current_lang, 'tab_eval_raw'))
        self.tabs.addTab(self.tab_issue_raw, get_i18n(self.current_lang, 'tab_issue_raw'))
        self.layout_hierarchy = QVBoxLayout(self.tab_hierarchy)
        self.layout_severity = QVBoxLayout(self.tab_severity)
        self.layout_models = QVBoxLayout(self.tab_models)
        self.layout_eval_raw = QVBoxLayout(self.tab_eval_raw)
        self.layout_issue_raw = QVBoxLayout(self.tab_issue_raw)
        self.create_raw_table_ui(self.layout_eval_raw, 'eval_', 'evaluations.csv')
        self.create_raw_table_ui(self.layout_issue_raw, 'issue_', 'issue_feedback.csv')

    def create_raw_table_ui(self, layout, prefix, export_name):
        toolbar = QHBoxLayout()
        toolbar.setSpacing(8)
        toolbar.setContentsMargins(14, 14, 14, 0)
        toolbar.addWidget(QLabel(get_i18n(self.current_lang, 'table_filter_label')))
        filter_input = QLineEdit()
        filter_input.setPlaceholderText(get_i18n(self.current_lang, 'table_filter_placeholder'))
        filter_input.setMaximumWidth(280)
        filter_input.setMinimumHeight(32)
        toolbar.addWidget(filter_input)
        export_btn = QPushButton(get_i18n(self.current_lang, 'table_export_btn'))
        export_btn.setMaximumWidth(120)
        export_btn.setMinimumHeight(32)
        toolbar.addWidget(export_btn)
        count_label = QLabel()
        count_label.setStyleSheet("color: #57606a; font-size: 12px; margin: 0 8px;")
        toolbar.addWidget(count_label)
        toolbar.addStretch()
        layout.addLayout(toolbar)
        table = QTableWidget()
        table.setSortingEnabled(True)
        table.setAlternatingRowColors(True)
        table.verticalHeader().setVisible(False)
        table.setSelectionBehavior(QTableWidget.SelectionBehavior.SelectRows)
        table.setSelectionMode(QTableWidget.SelectionMode.SingleSelection)
        layout.addWidget(table)
        setattr(self, f'{prefix}table', table)
        setattr(self, f'{prefix}filter', filter_input)
        setattr(self, f'{prefix}export', export_btn)
        setattr(self, f'{prefix}count', count_label)
        filter_input.textChanged.connect(self.populate_tables)
        export_btn.clicked.connect(lambda: self.export_table(self.df_eval if prefix == 'eval_' else self.df_issue, filter_input.text(), export_name))

    def set_language(self, lang):
        self.current_lang = lang
        self.settings.setValue('language', lang)
        self.settings.sync()
        lang_signal.changed.emit(lang)

    def on_language_changed(self, lang):
        if hasattr(self, 'url_input'):
            self.save_persistent_settings()
        self.current_lang = lang
        self.setWindowTitle(get_i18n(lang, 'app_title'))
        self.setup_ui()
        if not self.df_eval.empty or not self.df_issue.empty:
            self.populate_tables()
            if not self.df_issue.empty:
                self.plot_hierarchy()
                self.plot_models()
            if not self.df_eval.empty:
                self.plot_severity()

    def show_about(self):
        QMessageBox.information(self, 'About', 'Kagami Research Data Analyzer v2.1\n\nMulti-language support | Hot refresh | Professional UI\n\nLanguages: English | 中文 | 日本語')

    def load_persistent_settings(self):
        url = self.settings.value('apiBaseUrl', 'https://kagami.chizunet.cc', type=str)
        token = self.settings.value('accessToken', '', type=str)
        self.url_input.setText(url)
        self.token_input.setText(token)

    def save_persistent_settings(self):
        self.settings.setValue('apiBaseUrl', self.url_input.text().strip())
        self.settings.setValue('accessToken', self.token_input.text().strip())
        self.settings.sync()

    def filter_dataframe(self, df, keyword):
        if df.empty or not keyword:
            return df
        keyword = keyword.strip()
        if not keyword:
            return df
        mask = df.astype(str).apply(lambda col: col.str.contains(keyword, case=False, na=False, regex=False)).any(axis=1)
        return df[mask]

    def export_table(self, df, keyword, default_name):
        filtered = self.filter_dataframe(df, keyword)
        if filtered.empty:
            QMessageBox.warning(self, get_i18n(self.current_lang, 'error_export_empty'), get_i18n(self.current_lang, 'error_export_empty_msg'))
            return
        path, _ = QFileDialog.getSaveFileName(self, get_i18n(self.current_lang, 'table_export_btn'), default_name, 'CSV Files (*.csv)')
        if path:
            filtered.to_csv(path, index=False, encoding='utf-8-sig')
            self.status_label.setText(f"✓ Exported: {path.split(chr(92))[-1]}")

    def fetch_and_analyze(self):
        url = self.url_input.text().strip()
        token = self.token_input.text().strip()
        self.save_persistent_settings()
        endpoint = f'{url}/api/research/export?format=json&dataset=all'
        if token:
            endpoint += f'&token={token}'
        self.fetch_btn.setText(get_i18n(self.current_lang, 'fetch_running'))
        self.fetch_btn.setEnabled(False)
        self.status_label.setText(get_i18n(self.current_lang, 'fetch_progress'))
        QApplication.processEvents()
        try:
            resp = requests.get(endpoint, timeout=20)
            resp.raise_for_status()
            data = resp.json()
            self.df_eval = pd.DataFrame(data.get('evaluations', []))
            self.df_issue = pd.DataFrame(data.get('issueFeedback', []))
            self.status_label.setText(get_i18n(self.current_lang, 'fetch_success_status', len(self.df_eval), len(self.df_issue)))
            self.populate_tables()
            self.plot_hierarchy()
            self.plot_models()
            self.plot_severity()
            QMessageBox.information(self, get_i18n(self.current_lang, 'fetch_success_title'), get_i18n(self.current_lang, 'fetch_success_msg'))
        except requests.RequestException as e:
            QMessageBox.critical(self, get_i18n(self.current_lang, 'error_network'), get_i18n(self.current_lang, 'error_network_msg', str(e)[:80]))
        except requests.exceptions.JSONDecodeError as e:
            QMessageBox.critical(self, get_i18n(self.current_lang, 'error_json'), get_i18n(self.current_lang, 'error_json_msg', str(e)[:80]))
        except ValueError as e:
            QMessageBox.critical(self, get_i18n(self.current_lang, 'error_processing'), get_i18n(self.current_lang, 'error_processing_msg', str(e)[:80]))
        except Exception as e:
            QMessageBox.critical(self, 'Error', f'Unexpected error: {str(e)[:80]}')
        finally:
            self.fetch_btn.setText(get_i18n(self.current_lang, 'sidebar_fetch_btn'))
            self.fetch_btn.setEnabled(True)

    def populate_tables(self):
        def fill_table(table, df, filter_input, count_label):
            table.setSortingEnabled(False)
            table.clear()
            filtered = self.filter_dataframe(df, filter_input.text())
            if filtered.empty:
                table.setRowCount(0)
                table.setColumnCount(0)
                table.setSortingEnabled(True)
                count_label.setText('0 / 0')
                return
            try:
                table.setColumnCount(len(filtered.columns))
                table.setRowCount(len(filtered))
                table.setHorizontalHeaderLabels([str(c) for c in filtered.columns])
                for i in range(len(filtered)):
                    for j, col in enumerate(filtered.columns):
                        value = filtered.iloc[i][col]
                        text = safe_display_str(value)
                        item = SortableTableWidgetItem(text)
                        item.setData(Qt.ItemDataRole.UserRole, build_sort_key(value))
                        item.setFlags(item.flags() & ~Qt.ItemFlag.ItemIsEditable)
                        table.setItem(i, j, item)
                table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.ResizeToContents)
                table.setSortingEnabled(True)
                count_label.setText(get_i18n(self.current_lang, 'table_count_format', len(filtered), len(df)))
            except Exception as e:
                QMessageBox.warning(self, get_i18n(self.current_lang, 'error_table_fill'), get_i18n(self.current_lang, 'error_table_fill_msg', str(e)[:80]))
                table.setSortingEnabled(True)
        fill_table(self.eval_table, self.df_eval, self.eval_filter, self.eval_count)
        fill_table(self.issue_table, self.df_issue, self.issue_filter, self.issue_count)

    def plot_hierarchy(self):
        for i in reversed(range(self.layout_hierarchy.count())):
            widget = self.layout_hierarchy.itemAt(i).widget()
            if widget:
                widget.setParent(None)
        if self.df_issue.empty or 'layer' not in self.df_issue.columns:
            lbl = QLabel(get_i18n(self.current_lang, 'chart_hierarchy_empty'))
            lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            lbl.setStyleSheet("color: #57606a; font-size: 13px;")
            self.layout_hierarchy.addWidget(lbl)
            return
        fig = Figure(figsize=(12, 6.8), dpi=100)
        ax = fig.add_subplot(111)
        layer_stats = self.df_issue.groupby(['layer', 'vote']).size().unstack(fill_value=0)
        for v in ['agree', 'disagree']:
            if v not in layer_stats.columns:
                layer_stats[v] = 0
        layer_stats['Total'] = layer_stats['agree'] + layer_stats['disagree']
        layer_stats['Rate'] = (layer_stats['agree'] / layer_stats['Total'] * 100).round(1)
        order = ['grammar', 'register', 'pragmatics']
        layer_stats = layer_stats.reindex([x for x in order if x in layer_stats.index])
        layer_stats[['agree', 'disagree']].plot(kind='bar', ax=ax, color=['#2da44c', '#cf222e'], width=0.7)
        ax.set_title(get_i18n(self.current_lang, 'chart_hierarchy_title'), fontsize=15, fontweight='bold', pad=16, color='#24292f')
        ax.set_ylabel(get_i18n(self.current_lang, 'chart_hierarchy_ylabel'), fontsize=12, color='#424f5f')
        ax.set_xlabel(get_i18n(self.current_lang, 'chart_hierarchy_xlabel'), fontsize=12, color='#424f5f')
        ax.tick_params(axis='x', rotation=0, colors='#424f5f', labelsize=11)
        ax.tick_params(axis='y', colors='#424f5f', labelsize=11)
        ax.legend(labels=[get_i18n(self.current_lang, 'chart_hierarchy_agree'), get_i18n(self.current_lang, 'chart_hierarchy_disagree')], framealpha=0.9, loc='upper right')
        ax.grid(axis='y', linestyle='--', alpha=0.25, color='#d0d7de')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        for i, (idx, row) in enumerate(layer_stats.iterrows()):
            ax.annotate(get_i18n(self.current_lang, 'chart_hierarchy_rate', int(row['Rate'])), (i, max(row['agree'], row['disagree']) * 1.08), ha='center', fontsize=11, fontweight='bold', color='#24292f')
        fig.tight_layout()
        canvas = FigureCanvas(fig)
        self.layout_hierarchy.addWidget(canvas)

    def plot_models(self):
        for i in reversed(range(self.layout_models.count())):
            widget = self.layout_models.itemAt(i).widget()
            if widget:
                widget.setParent(None)
        if self.df_issue.empty or 'modelId' not in self.df_issue.columns:
            lbl = QLabel(get_i18n(self.current_lang, 'chart_hierarchy_empty'))
            lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            lbl.setStyleSheet("color: #57606a; font-size: 13px;")
            self.layout_models.addWidget(lbl)
            return

        # Replace NaN with 'Unknown' if necessary
        model_series = self.df_issue['modelId'].fillna('Unknown')
        fig = Figure(figsize=(12, 6.8), dpi=100)
        ax = fig.add_subplot(111)

        stats = self.df_issue.groupby([model_series, 'layer', 'vote']).size().unstack(fill_value=0)
        if 'agree' not in stats.columns:
            stats['agree'] = 0
        if 'disagree' not in stats.columns:
            stats['disagree'] = 0
            
        stats['Total'] = stats['agree'] + stats['disagree']
        stats['Rate'] = (stats['agree'] / stats['Total'] * 100).round(1)
        
        rates = stats['Rate'].unstack(level='layer')
        order = ['grammar', 'register', 'pragmatics']
        rates = rates[[x for x in order if x in rates.columns]]
        
        rates.plot(kind='bar', ax=ax, width=0.7)
        title_text = "Cross-Model Acceptance Rate (%)" if self.current_lang == 'en' else "跨模型接受率比较 (%)" if self.current_lang == 'zh' else "モデル間受容率比較 (%)"
        ax.set_title(title_text, fontsize=15, fontweight='bold', pad=16, color='#24292f')
        ax.set_ylabel("Agreement Rate (%)" if self.current_lang == 'en' else "同意率 (%)", fontsize=12, color='#424f5f')
        ax.set_xlabel("Model ID", fontsize=12, color='#424f5f')
        ax.tick_params(axis='x', rotation=15, colors='#424f5f', labelsize=11)
        ax.tick_params(axis='y', colors='#424f5f', labelsize=11)
        ax.legend(title="Layer", framealpha=0.9, loc='upper right')
        ax.grid(axis='y', linestyle='--', alpha=0.25, color='#d0d7de')
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        fig.tight_layout()
        canvas = FigureCanvas(fig)
        self.layout_models.addWidget(canvas)

    def plot_severity(self):
        for i in reversed(range(self.layout_severity.count())):
            widget = self.layout_severity.itemAt(i).widget()
            if widget:
                widget.setParent(None)
        if self.df_eval.empty:
            lbl = QLabel(get_i18n(self.current_lang, 'chart_severity_empty'))
            lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            lbl.setStyleSheet("color: #57606a; font-size: 13px;")
            self.layout_severity.addWidget(lbl)
            return
        sys_col = 'severityLevel' if 'severityLevel' in self.df_eval.columns else 'systemRating' if 'systemRating' in self.df_eval.columns else None
        rating_col = 'rating'
        if not sys_col or rating_col not in self.df_eval.columns:
            lbl = QLabel(get_i18n(self.current_lang, 'chart_severity_incomplete'))
            lbl.setAlignment(Qt.AlignmentFlag.AlignCenter)
            lbl.setStyleSheet("color: #57606a; font-size: 13px;")
            self.layout_severity.addWidget(lbl)
            return
        fig = Figure(figsize=(12, 6.8), dpi=100)
        ax = fig.add_subplot(111)
        cross_tab = pd.crosstab(self.df_eval[sys_col], self.df_eval[rating_col])
        order_sys = ['accurate', 'partial', 'inaccurate']
        order_usr = ['accurate', 'partial', 'inaccurate']
        cross_tab = cross_tab.reindex(index=[x for x in order_sys if x in cross_tab.index], columns=[x for x in order_usr if x in cross_tab.columns])
        cross_tab = cross_tab.rename(index={'accurate': get_i18n(self.current_lang, 'chart_severity_low'), 'partial': get_i18n(self.current_lang, 'chart_severity_medium'), 'inaccurate': get_i18n(self.current_lang, 'chart_severity_high')}, columns={'accurate': get_i18n(self.current_lang, 'chart_severity_helpful'), 'partial': get_i18n(self.current_lang, 'chart_severity_partial'), 'inaccurate': get_i18n(self.current_lang, 'chart_severity_unhelpful')})
        sns.heatmap(cross_tab, annot=True, fmt='g', cmap='Blues', ax=ax, cbar_kws={'label': 'Count'}, annot_kws={'fontsize': 12, 'weight': 'bold'})
        ax.set_title(get_i18n(self.current_lang, 'chart_severity_title'), fontsize=15, fontweight='bold', pad=16, color='#24292f')
        ax.set_ylabel(get_i18n(self.current_lang, 'chart_severity_ylabel'), fontsize=12, color='#424f5f')
        ax.set_xlabel(get_i18n(self.current_lang, 'chart_severity_xlabel'), fontsize=12, color='#424f5f')
        ax.tick_params(axis='both', colors='#424f5f', labelsize=11)
        fig.tight_layout()
        canvas = FigureCanvas(fig)
        self.layout_severity.addWidget(canvas)

if __name__ == '__main__':
    configure_matplotlib_font()
    app = QApplication(sys.argv)
    window = KagamiAnalyzerWindow()
    window.show()
    sys.exit(app.exec())

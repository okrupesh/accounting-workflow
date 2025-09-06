import streamlit as st
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import os
import time
from pathlib import Path

# Import plotly with error handling
try:
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    st.error("Plotly is not installed. Please install it using: pip install plotly")

# Configure Streamlit page
st.set_page_config(
    page_title="Accounting Dashboard",
    page_icon="💰",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Enhanced CSS with modern styling and animations
st.markdown("""
<style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    * {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .main > div {
        padding-top: 1rem;
    }
    
    /* Main background with gradient */
    .stApp {
        background: linear-gradient(135deg, #0f1419 0%, #1a1f2e 50%, #2d3748 100%);
        background-attachment: fixed;
    }
    
    /* Header styling */
    .dashboard-header {
        text-align: center;
        padding: 2rem 0 3rem 0;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%);
        border-radius: 20px;
        margin-bottom: 2rem;
        border: 1px solid rgba(59, 130, 246, 0.2);
        backdrop-filter: blur(10px);
    }
    
    .dashboard-title {
        font-size: 3.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #06d6a0 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin: 0;
        letter-spacing: -0.02em;
    }
    
    .dashboard-subtitle {
        font-size: 1.2rem;
        color: #94a3b8;
        margin: 0.5rem 0 0 0;
        font-weight: 400;
    }
    
    /* Enhanced metric containers */
    .metric-container {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
        backdrop-filter: blur(20px);
        padding: 2rem 1.5rem;
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.3),
            0 10px 10px -5px rgba(0, 0, 0, 0.2),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        height: 140px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
    }
    
    .metric-container::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6, #06d6a0);
        opacity: 0.6;
    }
    
    .metric-container:hover {
        transform: translateY(-5px);
        box-shadow: 
            0 32px 64px -12px rgba(0, 0, 0, 0.4),
            0 20px 32px -8px rgba(0, 0, 0, 0.3),
            inset 0 1px 0 rgba(255, 255, 255, 0.15);
        border-color: rgba(148, 163, 184, 0.2);
    }
    
    .big-metric {
        font-size: 2.5rem;
        font-weight: 700;
        background: linear-gradient(135deg, #06d6a0 0%, #3b82f6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-align: center;
        margin: 0 0 0.5rem 0;
        letter-spacing: -0.02em;
    }
    
    .metric-label {
        font-size: 0.9rem;
        color: #94a3b8;
        text-align: center;
        margin: 0;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Status badges with enhanced styling */
    .status-paid {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 0.4rem 1rem;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.8rem;
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        border: 1px solid rgba(16, 185, 129, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .status-unpaid {
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 0.4rem 1rem;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.8rem;
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        border: 1px solid rgba(239, 68, 68, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .status-pending {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        color: white;
        padding: 0.4rem 1rem;
        border-radius: 25px;
        font-weight: 600;
        font-size: 0.8rem;
        box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
        border: 1px solid rgba(245, 158, 11, 0.4);
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    /* Chart containers */
    .chart-container {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%);
        backdrop-filter: blur(20px);
        padding: 1.5rem;
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
        margin-bottom: 1.5rem;
    }
    
    /* Enhanced table styling */
    .dataframe {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
        backdrop-filter: blur(20px);
        border-radius: 15px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        overflow: hidden;
    }
    
    /* Section headers */
    .section-header {
        font-size: 1.8rem;
        font-weight: 600;
        color: #f1f5f9;
        margin: 2.5rem 0 1.5rem 0;
        text-align: center;
        position: relative;
        padding-bottom: 1rem;
    }
    
    .section-header::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60px;
        height: 3px;
        background: linear-gradient(90deg, #3b82f6, #8b5cf6);
        border-radius: 2px;
    }
    
    /* Filter containers */
    .filter-container {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(51, 65, 85, 0.4) 100%);
        backdrop-filter: blur(20px);
        padding: 1.5rem;
        border-radius: 15px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        margin-bottom: 2rem;
    }
    
    /* Insights container */
    .insights-container {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
        backdrop-filter: blur(20px);
        padding: 2rem;
        border-radius: 20px;
        border: 1px solid rgba(148, 163, 184, 0.1);
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
    }
    
    .insight-item {
        color: #cbd5e1;
        font-size: 1rem;
        margin: 0.8rem 0;
        padding: 0.5rem 0;
        border-left: 3px solid transparent;
        padding-left: 1rem;
        transition: all 0.3s ease;
    }
    
    .insight-item:hover {
        border-left-color: #3b82f6;
        color: #f1f5f9;
        transform: translateX(5px);
    }
    
    /* Footer styling */
    .footer {
        text-align: center;
        color: #64748b;
        font-size: 0.85rem;
        margin-top: 3rem;
        padding: 1.5rem;
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.3) 0%, rgba(51, 65, 85, 0.2) 100%);
        border-radius: 15px;
        border: 1px solid rgba(148, 163, 184, 0.05);
    }
    
    /* Selectbox styling */
    .stSelectbox > div > div {
        background: linear-gradient(145deg, rgba(30, 41, 59, 0.8) 0%, rgba(51, 65, 85, 0.6) 100%);
        color: white;
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 10px;
    }
    
    /* Hide Streamlit elements */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}
    header {visibility: hidden;}
    
    /* Scrollbar styling */
    ::-webkit-scrollbar {
        width: 8px;
    }
    
    ::-webkit-scrollbar-track {
        background: rgba(30, 41, 59, 0.3);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb {
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 4px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
        background: linear-gradient(135deg, #2563eb, #7c3aed);
    }
    
    /* Animation classes */
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .animate-fade-in {
        animation: fadeInUp 0.6s ease-out;
    }
</style>
""", unsafe_allow_html=True)

# Load and cache data
@st.cache_data(ttl=1)  # Cache for 1 second to enable real-time updates
def load_data():
    try:
        # Try different possible paths for the CSV file
        possible_paths = [
            'accounting.csv',  # Relative path (should work on Streamlit Cloud)
            '/mount/src/accounting-workflow/accounting.csv',  # Streamlit Cloud path
            '/workspaces/accounting-workflow/accounting.csv',  # Local development path
            './accounting.csv'  # Current directory
        ]
        
        df = None
        for path in possible_paths:
            try:
                df = pd.read_csv(path)
                # Debug info - can be removed later
                st.sidebar.success(f"✅ Data loaded from: {path}")
                break
            except FileNotFoundError:
                continue
        
        if df is None:
            st.error("Could not find accounting.csv file in any expected location.")
            return pd.DataFrame()
        
        # Clean and process data
        df['Date'] = pd.to_datetime(df['Date'], errors='coerce')
        df['Amount'] = pd.to_numeric(df['Amount'], errors='coerce')
        df['Merchant'] = df['Merchant'].fillna('Unknown')
        df['Type'] = df['Type'].fillna('Unknown')
        df['Status'] = df['Status'].fillna('Unknown')
        
        return df
    except Exception as e:
        st.error(f"Error loading data: {e}")
        return pd.DataFrame()

# Auto-refresh mechanism
def get_file_modification_time():
    possible_paths = [
        'accounting.csv',
        '/mount/src/accounting-workflow/accounting.csv',
        '/workspaces/accounting-workflow/accounting.csv',
        './accounting.csv'
    ]
    
    for path in possible_paths:
        try:
            return os.path.getmtime(path)
        except:
            continue
    return 0

# Initialize session state
if 'last_modified' not in st.session_state:
    st.session_state.last_modified = get_file_modification_time()

# Check for file changes and auto-refresh
current_modified = get_file_modification_time()
if current_modified != st.session_state.last_modified:
    st.session_state.last_modified = current_modified
    st.cache_data.clear()
    st.rerun()

# Auto-refresh every 2 seconds
placeholder = st.empty()
with placeholder.container():
    # Load data
    df = load_data()
    
    if df.empty:
        st.error("No data available or error loading CSV file.")
        st.stop()
    
    # Enhanced Header
    st.markdown("""
    <div class="dashboard-header animate-fade-in">
        <h1 class="dashboard-title">💰 Accounting Dashboard</h1>
        <p class="dashboard-subtitle">Real-time Financial Overview & Analytics</p>
    </div>
    """, unsafe_allow_html=True)
    
    # Key Metrics Row with enhanced styling
    col1, col2, col3, col4, col5 = st.columns(5)
    
    with col1:
        total_amount = df['Amount'].sum()
        st.markdown(f"""
        <div class="metric-container animate-fade-in">
            <p class="big-metric">${total_amount:,.2f}</p>
            <p class="metric-label">Total Amount</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col2:
        total_transactions = len(df)
        st.markdown(f"""
        <div class="metric-container animate-fade-in">
            <p class="big-metric">{total_transactions}</p>
            <p class="metric-label">Total Transactions</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col3:
        paid_amount = df[df['Status'] == 'Paid']['Amount'].sum()
        st.markdown(f"""
        <div class="metric-container animate-fade-in">
            <p class="big-metric">${paid_amount:,.2f}</p>
            <p class="metric-label">Paid Amount</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col4:
        unpaid_amount = df[df['Status'] == 'Unpaid']['Amount'].sum()
        st.markdown(f"""
        <div class="metric-container animate-fade-in">
            <p class="big-metric">${unpaid_amount:,.2f}</p>
            <p class="metric-label">Unpaid Amount</p>
        </div>
        """, unsafe_allow_html=True)
    
    with col5:
        avg_amount = df['Amount'].mean()
        st.markdown(f"""
        <div class="metric-container animate-fade-in">
            <p class="big-metric">${avg_amount:,.2f}</p>
            <p class="metric-label">Average Amount</p>
        </div>
        """, unsafe_allow_html=True)
    
    # Charts Section
    if PLOTLY_AVAILABLE:
        st.markdown('<h2 class="section-header">📊 Analytics Overview</h2>', unsafe_allow_html=True)
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Enhanced Status Distribution Pie Chart
            st.markdown('<div class="chart-container">', unsafe_allow_html=True)
            status_counts = df['Status'].value_counts()
            fig_pie = px.pie(
                values=status_counts.values,
                names=status_counts.index,
                title="Transaction Status Distribution",
                color_discrete_map={
                    'Paid': '#10b981',
                    'Unpaid': '#ef4444',
                    'Pending': '#f59e0b'
                }
            )
            fig_pie.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='white',
                title_font_size=18,
                title_font_family='Inter',
                title_x=0.5,
                showlegend=True,
                legend=dict(
                    orientation="v",
                    yanchor="middle",
                    y=0.5,
                    xanchor="left",
                    x=1.02
                )
            )
            fig_pie.update_traces(
                textfont_size=14,
                textfont_family='Inter',
                hovertemplate='<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>',
                pull=[0.05 if status == status_counts.index[0] else 0 for status in status_counts.index]
            )
            st.plotly_chart(fig_pie, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)
        
        with col2:
            # Enhanced Amount by Status Bar Chart
            st.markdown('<div class="chart-container">', unsafe_allow_html=True)
            status_amounts = df.groupby('Status')['Amount'].sum().reset_index()
            fig_bar = px.bar(
                status_amounts,
                x='Status',
                y='Amount',
                title="Total Amount by Status",
                color='Status',
                color_discrete_map={
                    'Paid': '#10b981',
                    'Unpaid': '#ef4444',
                    'Pending': '#f59e0b'
                }
            )
            fig_bar.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='white',
                title_font_size=18,
                title_font_family='Inter',
                title_x=0.5,
                xaxis=dict(
                    gridcolor='rgba(148, 163, 184, 0.1)',
                    title_font_family='Inter'
                ),
                yaxis=dict(
                    gridcolor='rgba(148, 163, 184, 0.1)',
                    title_font_family='Inter'
                ),
                showlegend=False
            )
            fig_bar.update_traces(
                hovertemplate='<b>%{x}</b><br>Amount: $%{y:,.2f}<extra></extra>',
            )
            st.plotly_chart(fig_bar, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)
        
        # Time Series Chart (if we have date data)
        if not df['Date'].isna().all():
            st.markdown('<div class="chart-container">', unsafe_allow_html=True)
            df_sorted = df.sort_values('Date')
            fig_time = px.line(
                df_sorted,
                x='Date',
                y='Amount',
                title="Transaction Amount Over Time",
                color='Status',
                color_discrete_map={
                    'Paid': '#10b981',
                    'Unpaid': '#ef4444',
                    'Pending': '#f59e0b'
                }
            )
            fig_time.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='white',
                title_font_size=18,
                title_font_family='Inter',
                title_x=0.5,
                xaxis=dict(
                    gridcolor='rgba(148, 163, 184, 0.1)',
                    title_font_family='Inter'
                ),
                yaxis=dict(
                    gridcolor='rgba(148, 163, 184, 0.1)',
                    title_font_family='Inter'
                )
            )
            fig_time.update_traces(
                line_width=3,
                hovertemplate='<b>%{fullData.name}</b><br>Date: %{x}<br>Amount: $%{y:,.2f}<extra></extra>'
            )
            st.plotly_chart(fig_time, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)
        
        # Transaction Type Distribution
        if 'Type' in df.columns:
            st.markdown('<div class="chart-container">', unsafe_allow_html=True)
            type_counts = df['Type'].value_counts()
            fig_type = px.bar(
                x=type_counts.index,
                y=type_counts.values,
                title="Transaction Type Distribution",
                color=type_counts.values,
                color_continuous_scale=['#1e293b', '#3b82f6', '#06d6a0']
            )
            fig_type.update_layout(
                plot_bgcolor='rgba(0,0,0,0)',
                paper_bgcolor='rgba(0,0,0,0)',
                font_color='white',
                title_font_size=18,
                title_font_family='Inter',
                title_x=0.5,
                xaxis=dict(
                    gridcolor='rgba(148, 163, 184, 0.1)',
                    title='Transaction Type',
                    title_font_family='Inter'
                ),
                yaxis=dict(
                    gridcolor='rgba(148, 163, 184, 0.1)',
                    title='Count',
                    title_font_family='Inter'
                ),
                showlegend=False,
                coloraxis_showscale=False
            )
            fig_type.update_traces(
                hovertemplate='<b>%{x}</b><br>Count: %{y}<extra></extra>'
            )
            st.plotly_chart(fig_type, use_container_width=True)
            st.markdown('</div>', unsafe_allow_html=True)
    else:
        st.warning("📊 Charts are not available. Plotly library needs to be installed for visualizations.")
        
        # Fallback: Show basic statistics instead of charts
        col1, col2 = st.columns(2)
        
        with col1:
            st.markdown("### Status Distribution")
            status_counts = df['Status'].value_counts()
            for status, count in status_counts.items():
                percentage = (count / len(df)) * 100
                st.write(f"**{status}**: {count} transactions ({percentage:.1f}%)")
        
        with col2:
            st.markdown("### Amount by Status")
            status_amounts = df.groupby('Status')['Amount'].sum()
            for status, amount in status_amounts.items():
                st.write(f"**{status}**: ${amount:,.2f}")
    
    # Transaction Details Section
    st.markdown('<h2 class="section-header">📋 Transaction Details</h2>', unsafe_allow_html=True)
    
    # Enhanced filters
    st.markdown('<div class="filter-container">', unsafe_allow_html=True)
    col1, col2, col3 = st.columns(3)
    with col1:
        status_filter = st.selectbox("Filter by Status", ["All"] + list(df['Status'].unique()))
    with col2:
        type_filter = st.selectbox("Filter by Type", ["All"] + list(df['Type'].unique()))
    with col3:
        merchant_filter = st.selectbox("Filter by Merchant", ["All"] + list(df['Merchant'].unique()))
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Apply filters
    filtered_df = df.copy()
    if status_filter != "All":
        filtered_df = filtered_df[filtered_df['Status'] == status_filter]
    if type_filter != "All":
        filtered_df = filtered_df[filtered_df['Type'] == type_filter]
    if merchant_filter != "All":
        filtered_df = filtered_df[filtered_df['Merchant'] == merchant_filter]
    
    # Format the dataframe for display
    display_df = filtered_df.copy()
    display_df['Amount'] = display_df['Amount'].apply(lambda x: f"${x:,.2f}")
    if 'Date' in display_df.columns:
        display_df['Date'] = pd.to_datetime(display_df['Date']).dt.strftime('%Y-%m-%d')
    
    # Convert relative links to full GitHub URLs
    if 'Link' in display_df.columns:
        display_df['Link'] = display_df['Link'].apply(
            lambda x: x.replace('./', 'https://github.com/okrupesh/accounting-workflow/tree/main/') if pd.notna(x) and x.startswith('./') else x
        )
    
    # Display table with custom styling
    st.dataframe(
        display_df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Status": st.column_config.TextColumn(
                "Status",
                help="Payment status"
            ),
            "Amount": st.column_config.TextColumn(
                "Amount",
                help="Transaction amount"
            ),
            "Link": st.column_config.LinkColumn(
                "Invoice Link",
                help="Link to invoice document"
            )
        }
    )
    
    # Enhanced Summary Statistics
    st.markdown('<h2 class="section-header">📊 Summary & Insights</h2>', unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="insights-container">', unsafe_allow_html=True)
        st.markdown("**Status Breakdown:**")
        for status in df['Status'].unique():
            count = len(df[df['Status'] == status])
            amount = df[df['Status'] == status]['Amount'].sum()
            percentage = (count / len(df)) * 100
            
            if status == 'Paid':
                status_class = 'status-paid'
            elif status == 'Unpaid':
                status_class = 'status-unpaid'
            else:
                status_class = 'status-pending'
            
            st.markdown(f"""
            <div style="margin: 1rem 0;">
                <span class="{status_class}">{status}</span>
                <span style="margin-left: 1rem; color: #cbd5e1; font-weight: 500;">
                    {count} transactions ({percentage:.1f}%) - ${amount:,.2f}
                </span>
            </div>
            """, unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="insights-container">', unsafe_allow_html=True)
        st.markdown("**Key Insights:**")
        insights = []
        
        # Calculate insights
        if len(df) > 0:
            highest_amount = df['Amount'].max()
            lowest_amount = df['Amount'].min()
            most_common_type = df['Type'].mode().iloc[0] if not df['Type'].mode().empty else "N/A"
            
            insights.append(f"💎 Highest transaction: ${highest_amount:,.2f}")
            insights.append(f"📉 Lowest transaction: ${lowest_amount:,.2f}")
            insights.append(f"📈 Most common type: {most_common_type}")
            
            unpaid_count = len(df[df['Status'] == 'Unpaid'])
            if unpaid_count > 0:
                insights.append(f"⚠️ {unpaid_count} unpaid transactions")
            
            for insight in insights:
                st.markdown(f"<div class='insight-item'>{insight}</div>", unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Enhanced Footer
    last_updated = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    st.markdown(f"""
    <div class="footer">
        <p>Last updated: {last_updated} | Auto-refreshing every 2 seconds</p>
        <p style="margin-top: 0.5rem; font-size: 0.75rem; opacity: 0.7;">
            Built with ❤️ using Streamlit & Modern UI Design
        </p>
    </div>
    """, unsafe_allow_html=True)

# Auto-refresh mechanism
time.sleep(2)
st.rerun()

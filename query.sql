SELECT 
    strftime('%Y-%m', CAST(date AS TIMESTAMP)) AS year_month, 
    COUNT(*) AS total_commits
FROM 
    data
GROUP BY 
    year_month
ORDER BY 
    year_month;
SELECT
  p.ProductName,
  SUM(od.Quantity) AS units_sold,
  ROUND(SUM(od.Quantity * od.UnitPrice), 2) AS revenue
FROM Products p
JOIN "Order Details" od ON p.ProductID = od.ProductID
JOIN Orders o ON od.OrderID = o.OrderID
JOIN Customers c ON o.CustomerID = c.CustomerID
WHERE c.Country = '{{country}}'
GROUP BY p.ProductID
ORDER BY revenue DESC
LIMIT 5;

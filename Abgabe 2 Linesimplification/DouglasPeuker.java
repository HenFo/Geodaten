import java.awt.geom.Line2D;
import java.awt.geom.Path2D;
import java.awt.geom.Point2D;
import java.util.ArrayList;

public class DouglasPeuker {

    public static void main(String[] args) {

        int[][] points = {{0,0},{1,10},{3,15},{6,14},{8,15},{9,11},{11,16},{12,20}};
        ArrayList<Point2D> path = new ArrayList<Point2D>();
        ArrayList<Point2D> landmarks = new ArrayList<Point2D>();
        for (int i = 0; i < points.length; i++) {
            path.add(new Point2D.Double(points[i][0], points[i][1]));
        }
        path.trimToSize();
        landmarks.trimToSize();
        System.out.println("Start: " + path);
        System.out.println("");
        System.out.println("Result = " + topoPathSimplification(path, landmarks, 4));
    }
    
    public static ArrayList<Point2D> topoPathSimplification (ArrayList<Point2D> path, ArrayList<Point2D> landmarks, double tolerance) {
        ArrayList<Point2D> res = new ArrayList<Point2D>();
        Line2D l = new Line2D.Double(path.get(0), path.get(path.size()-1)); //linie vom Anfang bis zum Ende von path
        int index = 0; //point p der am weitsten von der Linie entfernt ist
        double maxDist = 0; //distanz zwischen p und l
        //Maximumssuche
        for (int i = 0; i < path.size(); i++) {
            double dist = l.ptLineDist(path.get(i));
            if (maxDist < dist) {
                maxDist = dist;
                index = i;
            }
        }

        //simplification
        if (maxDist > tolerance) {
            //split List
            ArrayList<Point2D> left = new ArrayList<Point2D>();
            left.addAll(path.subList(0, index+1)); //first half of the path including the maxDist Point
            ArrayList<Point2D> right = new ArrayList<Point2D>();
            right.addAll(path.subList(index, path.size())); //second half of the path including the maxDist Point
            //trimms List to correct size
            left.trimToSize();
            right.trimToSize();

            System.out.println("links: " + left);
            System.out.println("rechts: " + right);
            System.out.println("");

            res = topoPathSimplification(left, landmarks, tolerance);

            ArrayList<Point2D> secondRes = topoPathSimplification(right, landmarks, tolerance);
            secondRes.remove(0);

            res.addAll(secondRes);

            System.out.println("Union: " + res);

            // res = topoPathSimplification(left, landmarks, tolerance).addAll(1,topoPathSimplification(right, landmarks, tolerance));

        } else {
            ArrayList<Point2D> ret = new ArrayList<Point2D>();
            ret.add(path.get(0));
            ret.add(path.get(path.size()-1));
            res = ret;
            System.out.println("gekuerzt: " + ret);
            System.out.println("");
       }

        return res;
    }
}
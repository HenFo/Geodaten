import java.awt.geom.Line2D;
import java.awt.geom.Path2D;
import java.awt.geom.Point2D;
import java.util.ArrayList;

public class DouglasPeukerTopoSimple {

    public static void main(String[] args) {
        /* int[][] points = {{0,10},{2,10},{3,11},{4,12},{5,12},{6,11},{7,10},{8,10},{9,10}};
        int[][] lmarks = {{4,11}};  */

        int[][] points = {{1,1},{1,3},{2,5},{4,6},{5,10},{5,16},{6,19},{8,18},{9,14}};
        int[][] lmarks = {{1,2},{2,4},{3,7},{4,8},{6,17},{7,16},{8,17}};

        ArrayList<Point2D> path = new ArrayList<Point2D>();
        ArrayList<Point2D> landmarks = new ArrayList<Point2D>();
        for (int i = 0; i < points.length; i++) {
            path.add(new Point2D.Double(points[i][0], points[i][1]));
        }
        for (int i = 0; i < lmarks.length; i++) {
            landmarks.add(new Point2D.Double(lmarks[i][0], lmarks[i][1]));
        }

        path.trimToSize();
        landmarks.trimToSize();
        
        System.out.println("start simple topo \n");
        System.out.println("Start: " + path);
        System.out.println("");
        System.out.println("Result = " + topoPathSimplification(path, landmarks, 4, true));
    }
    
    public static ArrayList<Point2D> topoPathSimplification (ArrayList<Point2D> path, ArrayList<Point2D> landmarks, double tolerance, boolean keepTopology) {
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

            res = topoPathSimplification(left, landmarks, tolerance, keepTopology);

            ArrayList<Point2D> secondRes = topoPathSimplification(right, landmarks, tolerance, keepTopology);
            secondRes.remove(0);

            res.addAll(secondRes);

            System.out.println("Union: " + res);

        } else { //delete points within threshold
            boolean flag = false;
            if(keepTopology) {
                Path2D path2d = new Path2D.Double();
                for (int i = 0; i < path.size()-1; i++) {
                    Line2D line = new Line2D.Double(path.get(i), path.get(i+1));
                    path2d.append(line, true);
                }

                for (int i = 0; i < landmarks.size() && !flag; i++) {
                    flag = path2d.contains(landmarks.get(i));
                }
            }

            if (flag && tolerance>0) {
                System.out.println("Topologie Conflict \n");
                res = topoPathSimplification(path, landmarks, tolerance-0.5, keepTopology);
            } else {
                ArrayList<Point2D> ret = new ArrayList<Point2D>();
                ret.add(path.get(0));
                ret.add(path.get(path.size()-1));
                res = ret;

                System.out.println("gekuerzt: " + ret);
                System.out.println("\n");
            }
       }

        return res;
    }
}
